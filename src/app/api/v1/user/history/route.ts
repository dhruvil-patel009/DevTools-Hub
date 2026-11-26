import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const history = await prisma.toolUsage.findMany({
    where: { userId: authRes.actor.id },
    include: {
      tool: { select: { name: true, slug: true, icon: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return apiSuccess(history);
}

export async function DELETE() {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    await prisma.toolUsage.deleteMany({
      where: { userId: authRes.actor.id },
    });

    return apiSuccess({ cleared: true });
  } catch (err) {
    return handleUnexpectedError(err, 'DELETE /api/v1/user/history');
  }
}
