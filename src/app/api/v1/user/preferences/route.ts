import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const prefSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).optional(),
  editorFontSize: z.number().int().min(10).max(24).optional(),
  editorTabSize: z.number().int().min(2).max(8).optional(),
  editorWordWrap: z.boolean().optional(),
  historyEnabled: z.boolean().optional(),
});

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const pref = await prisma.userPreference.upsert({
    where: { userId: authRes.actor.id },
    update: {},
    create: { userId: authRes.actor.id },
  });

  return apiSuccess(pref);
}

export async function PATCH(request: NextRequest) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = prefSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid preference values.', 400);
    }

    const updated = await prisma.userPreference.upsert({
      where: { userId: authRes.actor.id },
      update: parsed.data,
      create: { userId: authRes.actor.id, ...parsed.data },
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/user/preferences');
  }
}
