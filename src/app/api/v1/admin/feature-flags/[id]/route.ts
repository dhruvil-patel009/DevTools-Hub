import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { recordAuditLog, requireAdmin } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const flagSchema = z.object({
  enabled: z.boolean(),
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
    const parsed = flagSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid feature flag payload.', 400);
    }

    const updated = await prisma.featureFlag.update({
      where: { id },
      data: { enabled: parsed.data.enabled },
    });

    await recordAuditLog(authRes.actor.id, 'ADMIN_TOGGLE_FEATURE_FLAG', 'FeatureFlag', id, {
      key: updated.key,
      enabled: parsed.data.enabled,
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/admin/feature-flags/[id]');
  }
}
