import { prisma } from '@/lib/database/prisma';
import { isLastActiveSuperAdmin, requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function DELETE() {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    if (await isLastActiveSuperAdmin(authRes.actor.id)) {
      return apiError(
        'LAST_SUPER_ADMIN',
        'Cannot delete the final active super administrator account.',
        409
      );
    }

    await prisma.user.delete({
      where: { id: authRes.actor.id },
    });

    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleUnexpectedError(err, 'DELETE /api/v1/user/account');
  }
}
