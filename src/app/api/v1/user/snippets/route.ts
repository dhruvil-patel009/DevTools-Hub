import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const snippetSchema = z.object({
  title: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(40).default('plaintext'),
  content: z.string().min(1).max(100_000),
});

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const snippets = await prisma.savedSnippet.findMany({
    where: { userId: authRes.actor.id },
    orderBy: { updatedAt: 'desc' },
  });

  return apiSuccess(snippets);
}

export async function POST(request: NextRequest) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = snippetSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid snippet.', 400);
    }

    const snippet = await prisma.savedSnippet.create({
      data: {
        userId: authRes.actor.id,
        ...parsed.data,
      },
    });

    return apiSuccess(snippet, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/user/snippets');
  }
}
