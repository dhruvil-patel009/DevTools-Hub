import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { recordAuditLog, requireAdmin } from '@/server/permissions/auth';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(40).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(5).max(300),
  icon: z.string().trim().min(1).max(40).default('Wrench'),
  sortOrder: z.number().int().min(0).default(10),
});

export async function GET() {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const categories = await prisma.category.findMany({
      include: { _count: { select: { tools: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return apiSuccess(categories);
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/categories');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid category.', 400);
    }

    const created = await prisma.category.create({ data: parsed.data });
    await recordAuditLog(authRes.actor.id, 'ADMIN_CREATE_CATEGORY', 'Category', created.id, {
      slug: created.slug,
    });
    return apiSuccess(created, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/admin/categories');
  }
}
