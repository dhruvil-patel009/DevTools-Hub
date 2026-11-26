import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';
import { getToolBySlug } from '@/lib/tool-registry/tools';
import { isDatabaseConfigured } from '@/config/env';
import { prisma } from '@/lib/database/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

const usageSchema = z.object({
  toolSlug: z.string().min(1).max(100),
  success: z.boolean().default(true),
  durationMs: z.number().int().min(0).max(600000).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rl = await checkRateLimit(`usage:${ip}`, { limit: 120, windowSeconds: 60 });
    if (!rl.allowed) {
      return apiError('RATE_LIMITED', 'Too many analytics events.', 429);
    }

    const body = await request.json();
    const parsed = usageSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid analytics payload.', 400);
    }

    const toolDef = getToolBySlug(parsed.data.toolSlug);
    if (!toolDef) {
      return apiError('TOOL_NOT_FOUND', 'Unknown tool slug.', 404);
    }

    if (!isDatabaseConfigured()) {
      return apiSuccess({ recorded: false });
    }

    const dbTool = await prisma.tool.findUnique({
      where: { slug: toolDef.slug },
      select: { id: true },
    });

    if (!dbTool) {
      return apiSuccess({ recorded: false });
    }

    await prisma.toolUsage.create({
      data: {
        toolId: dbTool.id,
        success: parsed.data.success,
        durationMs: parsed.data.durationMs,
      },
    });

    return apiSuccess({ recorded: true }, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/analytics/tool-usage');
  }
}
