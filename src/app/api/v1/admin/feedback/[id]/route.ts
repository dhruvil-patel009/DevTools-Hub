import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { recordAuditLog, requireAdmin } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const updateFeedbackSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']),
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
    const parsed = updateFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid feedback status.', 400);
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await recordAuditLog(authRes.actor.id, 'ADMIN_UPDATE_FEEDBACK', 'Feedback', id, {
      status: parsed.data.status,
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/admin/feedback/[id]');
  }
}
