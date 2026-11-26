import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const user = await prisma.user.findUnique({
    where: { id: authRes.actor.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) return apiError('NOT_FOUND', 'User not found.', 404);
  return apiSuccess(user);
}

export async function PATCH(request: NextRequest) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid input.', 400);
    }

    const updated = await prisma.user.update({
      where: { id: authRes.actor.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true, role: true },
    });

    return apiSuccess(updated);
  } catch (err) {
    return handleUnexpectedError(err, 'PATCH /api/v1/user/profile');
  }
}
