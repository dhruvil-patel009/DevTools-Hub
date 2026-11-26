import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { recordAuditLog, requireAdmin } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.record(z.unknown()),
});

export async function GET() {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const settings = await prisma.appSetting.findMany({ orderBy: { key: 'asc' } });
    return apiSuccess(settings);
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/settings');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = updateSettingSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid setting payload.', 400);
    }

    const updated = await prisma.appSetting.upsert({
      where: { key: parsed.data.key },
      update: { value: parsed.data.value as object },
      create: { key: parsed.data.key, value: parsed.data.value as object },
    });

    await recordAuditLog(authRes.actor.id, 'ADMIN_UPDATE_SETTING', 'AppSetting', updated.id, {
      key: parsed.data.key,
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/admin/settings');
  }
}
