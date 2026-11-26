import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';
import { checkRateLimit } from '@/lib/rate-limit';
import { isDatabaseConfigured } from '@/config/env';
import { prisma } from '@/lib/database/prisma';

const feedbackSchema = z.object({
  category: z.enum(['general', 'bug', 'feature']).default('general'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters.').max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rl = await checkRateLimit(`feedback:${ip}`, { limit: 10, windowSeconds: 60 });
    if (!rl.allowed) {
      return apiError('RATE_LIMITED', 'Too many feedback submissions. Please try again later.', 429);
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid input.', 400);
    }

    if (!isDatabaseConfigured()) {
      return apiSuccess({ accepted: true, stored: false }, 202);
    }

    const created = await prisma.feedback.create({
      data: {
        category: parsed.data.category,
        message: parsed.data.message,
      },
      select: { id: true, category: true, status: true, createdAt: true },
    });

    return apiSuccess(created, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/feedback');
  }
}
