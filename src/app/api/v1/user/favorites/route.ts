import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const addFavSchema = z.object({
  toolSlug: z.string().min(1).max(100),
});

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const favorites = await prisma.favorite.findMany({
    where: { userId: authRes.actor.id },
    include: {
      tool: {
        select: { id: true, name: true, slug: true, icon: true, description: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return apiSuccess(favorites);
}

export async function POST(request: NextRequest) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = addFavSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid toolSlug.', 400);
    }

    const tool = await prisma.tool.findUnique({
      where: { slug: parsed.data.toolSlug },
      select: { id: true },
    });
    if (!tool) {
      return apiError('TOOL_NOT_FOUND', 'Tool not found.', 404);
    }

    const favorite = await prisma.favorite.upsert({
      where: { userId_toolId: { userId: authRes.actor.id, toolId: tool.id } },
      update: {},
      create: { userId: authRes.actor.id, toolId: tool.id },
    });

    return apiSuccess(favorite, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/user/favorites');
  }
}
