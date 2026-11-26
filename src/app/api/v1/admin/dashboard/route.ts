import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/server/permissions/auth';
import { apiSuccess, handleUnexpectedError } from '@/server/http/response';
import { isAIConfigured, isDatabaseConfigured } from '@/config/env';

export async function GET() {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    if (!isDatabaseConfigured()) {
      return apiSuccess({
        totalUsers: 0,
        activeUsers: 0,
        totalExecutions: 0,
        aiRequests: 0,
        aiErrors: 0,
        mostUsedTools: [],
        recentAuditLogs: [],
        health: { database: 'unconfigured', ai: isAIConfigured() ? 'configured' : 'unconfigured' },
      });
    }

    const [
      totalUsers,
      activeUsers,
      totalExecutions,
      aiRequests,
      aiErrors,
      groupedTools,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.toolUsage.count(),
      prisma.aIUsage.count(),
      prisma.aIUsage.count({ where: { status: 'ERROR' } }),
      prisma.toolUsage.groupBy({
        by: ['toolId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { actor: { select: { email: true, role: true } } },
      }),
    ]);

    const tools = groupedTools.length
      ? await prisma.tool.findMany({
          where: { id: { in: groupedTools.map((g) => g.toolId) } },
          select: { id: true, name: true, slug: true },
        })
      : [];
    const toolMap = new Map(tools.map((t) => [t.id, t]));

    return apiSuccess({
      totalUsers,
      activeUsers,
      totalExecutions,
      aiRequests,
      aiErrors,
      mostUsedTools: groupedTools.map((g) => ({
        name: toolMap.get(g.toolId)?.name ?? 'Unknown',
        slug: toolMap.get(g.toolId)?.slug ?? '',
        count: g._count.id,
      })),
      recentAuditLogs,
      health: {
        database: 'connected',
        ai: isAIConfigured() ? 'configured' : 'unconfigured',
      },
    });
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/dashboard');
  }
}
