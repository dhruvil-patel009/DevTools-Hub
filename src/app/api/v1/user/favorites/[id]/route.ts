import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const { id } = await context.params;
    const deleted = await prisma.favorite.deleteMany({
      where: { id, userId: authRes.actor.id },
    });

    if (deleted.count === 0) {
      return apiError('NOT_FOUND', 'Favorite not found.', 404);
    }

    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleUnexpectedError(err, 'DELETE /api/v1/user/favorites/[id]');
  }
}
