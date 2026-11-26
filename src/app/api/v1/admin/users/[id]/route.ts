import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import {
  canManageAdminRoles,
  isLastActiveSuperAdmin,
  recordAuditLog,
  requireAdmin,
} from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const updateUserSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid user update payload.', 400);
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return apiError('NOT_FOUND', 'User not found.', 404);
    }

    if (parsed.data.role && parsed.data.role !== target.role) {
      if (!canManageAdminRoles(authRes.actor.role)) {
        return apiError(
          'FORBIDDEN',
          'Only SUPER_ADMIN may grant or revoke administrator privileges.',
          403
        );
      }
    }

    const removingSuperAdmin =
      target.role === 'SUPER_ADMIN' &&
      ((parsed.data.role && parsed.data.role !== 'SUPER_ADMIN') ||
        parsed.data.status === 'SUSPENDED');

    if (removingSuperAdmin && (await isLastActiveSuperAdmin(target.id))) {
      return apiError(
        'LAST_SUPER_ADMIN',
        'Cannot demote or suspend the final active super administrator.',
        409
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, email: true, role: true, status: true },
    });

    await recordAuditLog(authRes.actor.id, 'ADMIN_UPDATE_USER', 'User', id, {
      changes: parsed.data,
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/admin/users/[id]');
  }
}
