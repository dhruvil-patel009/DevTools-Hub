import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AIRequestStatus } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { isAIConfigured, isDatabaseConfigured } from '@/config/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { runGeminiTask, streamGeminiTask, type AiTaskType } from '@/lib/ai/gemini';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const aiRequestSchema = z.object({
  language: z.string().trim().min(1).max(40),
  code: z.string().trim().min(1, 'Code input is required.').max(20_000, 'Code exceeds 20,000 character limit.'),
  consentConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'Explicit consent is required before sending code to the AI provider.' }),
  }),
});

const TOOL_SLUG_MAP: Record<AiTaskType, string> = {
  explain: 'ai-code-explainer',
  review: 'ai-code-reviewer',
  documentation: 'ai-documentation-generator',
};

export async function handleAiRoute(request: NextRequest, task: AiTaskType) {
  try {
    if (!isAIConfigured()) {
      return apiError(
        'AI_UNAVAILABLE',
        'AI assistance is not configured on this server. Core client-side tools remain fully available.',
        503
      );
    }

    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const rl = await checkRateLimit(`ai:${authRes.actor.id}`, { limit: 10, windowSeconds: 60 });
    if (!rl.allowed) {
      return apiError('RATE_LIMITED', 'Too many AI requests. Please wait a minute.', 429);
    }

    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid AI request.', 400);
    }

    const dailyLimit = Number(process.env.AI_DAILY_LIMIT || 25);
    let dbToolId: string | null = null;

    if (isDatabaseConfigured()) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const usedToday = await prisma.aIUsage.count({
        where: {
          userId: authRes.actor.id,
          createdAt: { gte: startOfDay },
          status: AIRequestStatus.SUCCESS,
        },
      });

      if (usedToday >= dailyLimit) {
        return apiError('QUOTA_EXCEEDED', `Daily AI quota of ${dailyLimit} requests reached.`, 429);
      }

      const dbTool = await prisma.tool.findUnique({
        where: { slug: TOOL_SLUG_MAP[task] },
        select: { id: true },
      });
      dbToolId = dbTool?.id ?? null;
    }

    const wantStream = request.nextUrl.searchParams.get('stream') === '1';

    try {
      if (wantStream) {
        const { stream, model } = await streamGeminiTask(
          task,
          parsed.data.language,
          parsed.data.code
        );
        const encoder = new TextEncoder();
        const actorId = authRes.actor.id;

        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream) {
                const text = chunk.text();
                if (text) controller.enqueue(encoder.encode(text));
              }
              if (isDatabaseConfigured() && dbToolId) {
                await prisma.aIUsage.create({
                  data: {
                    userId: actorId,
                    toolId: dbToolId,
                    provider: 'gemini',
                    model,
                    status: AIRequestStatus.SUCCESS,
                  },
                });
              }
              controller.close();
            } catch (streamErr) {
              controller.error(streamErr);
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
          },
        });
      }

      const result = await runGeminiTask(task, parsed.data.language, parsed.data.code);

      if (isDatabaseConfigured() && dbToolId) {
        await prisma.aIUsage.create({
          data: {
            userId: authRes.actor.id,
            toolId: dbToolId,
            provider: 'gemini',
            model: result.model,
            inputTokens: result.inputTokens ?? null,
            outputTokens: result.outputTokens ?? null,
            status: AIRequestStatus.SUCCESS,
          },
        });
      }

      return apiSuccess({
        output: result.output,
        model: result.model,
      });
    } catch (providerErr) {
      const safeMsg =
        providerErr instanceof Error ? providerErr.message : 'Unknown Gemini provider error';
      console.error(`[AI:${task}] Gemini provider error: ${safeMsg}`);

      if (isDatabaseConfigured() && dbToolId) {
        await prisma.aIUsage.create({
          data: {
            userId: authRes.actor.id,
            toolId: dbToolId,
            provider: 'gemini',
            model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
            status: AIRequestStatus.ERROR,
          },
        });
      }
      let clientMsg = 'AI provider failed to generate a response.';
      if (safeMsg.includes('429') || safeMsg.includes('RESOURCE_EXHAUSTED')) {
        clientMsg = 'Gemini API rate limit or free-tier quota exceeded. Please try again later.';
      } else if (safeMsg.includes('API_KEY_INVALID') || safeMsg.includes('API key not valid')) {
        clientMsg = 'Configured Gemini API key is invalid or restricted.';
      } else if (safeMsg.includes('403') || safeMsg.includes('PERMISSION_DENIED')) {
        clientMsg = 'Gemini API permission denied. Ensure Generative Language API is enabled.';
      }

      return apiError('AI_PROVIDER_ERROR', clientMsg, 502);
    }
  } catch (err) {
    return handleUnexpectedError(err, `POST /api/v1/ai/${task}`);
  }
}
