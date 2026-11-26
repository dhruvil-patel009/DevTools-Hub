import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/server/permissions/auth';
import { apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function GET() {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [toolUsages, aiUsages] = await Promise.all([
      prisma.toolUsage.findMany({
        where: { createdAt: { gte: since } },
        select: { success: true, durationMs: true, createdAt: true, tool: { select: { categoryId: true } } },
        take: 5000,
      }),
      prisma.aIUsage.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    return apiSuccess({
      last30DaysExecutions: toolUsages.length,
      successRate:
        toolUsages.length > 0
          ? Number(((toolUsages.filter((u) => u.success).length / toolUsages.length) * 100).toFixed(1))
          : 100,
      aiUsageByStatus: aiUsages,
    });
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/analytics');
  }
}
