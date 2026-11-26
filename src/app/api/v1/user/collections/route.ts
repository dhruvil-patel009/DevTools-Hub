import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { sanitizeHeaders } from '@/lib/security/redact';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const collectionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  requests: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
        url: z.string().url().max(2000),
        headers: z.record(z.string()).default({}),
        queryParams: z
          .array(z.object({ key: z.string(), value: z.string() }))
          .default([]),
        approvedBody: z.string().max(50_000).optional(),
      })
    )
    .optional(),
});

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const collections = await prisma.apiCollection.findMany({
    where: { userId: authRes.actor.id },
    include: { requests: true },
    orderBy: { updatedAt: 'desc' },
  });

  return apiSuccess(collections);
}

export async function POST(request: NextRequest) {
  try {
    const authRes = await requireAuth();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = collectionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid collection.', 400);
    }

    const created = await prisma.apiCollection.create({
      data: {
        userId: authRes.actor.id,
        name: parsed.data.name,
        description: parsed.data.description,
        requests: parsed.data.requests
          ? {
              create: parsed.data.requests.map((r) => ({
                name: r.name,
                method: r.method,
                url: r.url,
                // Always strip credentials & authorization headers before saving
                sanitizedHeaders: sanitizeHeaders(r.headers),
                queryParams: r.queryParams,
                approvedBody: r.approvedBody,
              })),
            }
          : undefined,
      },
      include: { requests: true },
    });

    return apiSuccess(created, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/user/collections');
  }
}
