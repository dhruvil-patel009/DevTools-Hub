import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AIRequestStatus } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { isAIConfigured, isDatabaseConfigured } from '@/config/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { runGeminiTask, type AiTaskType } from '@/lib/ai/gemini';
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

    try {
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
    } catch {
      if (isDatabaseConfigured() && dbToolId) {
        await prisma.aIUsage.create({
          data: {
            userId: authRes.actor.id,
            toolId: dbToolId,
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            status: AIRequestStatus.ERROR,
          },
        });
      }
      return apiError('AI_PROVIDER_ERROR', 'AI provider failed to generate a response.', 502);
    }
  } catch (err) {
    return handleUnexpectedError(err, `POST /api/v1/ai/${task}`);
  }
}
