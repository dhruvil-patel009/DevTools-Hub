import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const updateSnippetSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  language: z.string().trim().min(1).max(40).optional(),
  content: z.string().min(1).max(100_000).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSnippetSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid snippet update.', 400);
    }

    const existing = await prisma.savedSnippet.findFirst({
      where: { id, userId: authRes.actor.id },
    });
    if (!existing) {
      return apiError('NOT_FOUND', 'Snippet not found.', 404);
    }

    const updated = await prisma.savedSnippet.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/user/snippets/[id]');
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const { id } = await context.params;
    const deleted = await prisma.savedSnippet.deleteMany({
      where: { id, userId: authRes.actor.id },
    });
    if (deleted.count === 0) {
      return apiError('NOT_FOUND', 'Snippet not found.', 404);
    }
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleUnexpectedError(err, 'DELETE /api/v1/user/snippets/[id]');
  }
}
