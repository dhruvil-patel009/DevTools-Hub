import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { recordAuditLog, requireAdmin } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const updateToolSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
  seoTitle: z.string().trim().min(1).max(160).optional(),
  seoDescription: z.string().trim().min(1).max(320).optional(),
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
    const parsed = updateToolSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid tool update payload.', 400);
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: parsed.data,
    });

    await recordAuditLog(authRes.actor.id, 'ADMIN_UPDATE_TOOL', 'Tool', id, {
      changes: parsed.data,
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/admin/tools/[id]');
  }
}
