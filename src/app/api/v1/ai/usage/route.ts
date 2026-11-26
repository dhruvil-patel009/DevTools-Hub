import { AIRequestStatus } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { isAIConfigured, isDatabaseConfigured } from '@/config/env';
import { requireAuth } from '@/server/permissions/auth';
import { apiSuccess } from '@/server/http/response';

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const dailyLimit = Number(process.env.AI_DAILY_LIMIT || 25);
  let usedToday = 0;

  if (isDatabaseConfigured()) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    usedToday = await prisma.aIUsage.count({
      where: {
        userId: authRes.actor.id,
        createdAt: { gte: startOfDay },
        status: AIRequestStatus.SUCCESS,
      },
    });
  }

  return apiSuccess({
    aiAvailable: isAIConfigured(),
    usedToday,
    dailyLimit,
    remaining: Math.max(0, dailyLimit - usedToday),
  });
}
