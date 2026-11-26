import { apiSuccess } from '@/server/http/response';
import { isDatabaseConfigured } from '@/config/env';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return apiSuccess([]);
  }

  try {
    const grouped = await prisma.toolUsage.groupBy({
      by: ['toolId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    if (grouped.length === 0) return apiSuccess([]);

    const tools = await prisma.tool.findMany({
      where: { id: { in: grouped.map((g) => g.toolId) }, isActive: true },
      select: { id: true, slug: true, name: true, categoryId: true },
    });

    const toolMap = new Map(tools.map((t) => [t.id, t]));
    const result = grouped
      .map((g) => {
        const tool = toolMap.get(g.toolId);
        return tool ? { slug: tool.slug, name: tool.name, executions: g._count.id } : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    return apiSuccess(result);
  } catch {
    return apiSuccess([]);
  }
}
