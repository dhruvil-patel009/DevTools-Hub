import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/server/permissions/auth';
import { apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function GET(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const search = request.nextUrl.searchParams.get('q')?.trim() || '';
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || 20)));

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { toolUsages: true, aiUsages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess(users, 200, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/users');
  }
}
