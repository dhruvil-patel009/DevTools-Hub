import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/server/permissions/auth';
import { apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function GET(request: NextRequest) {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || 30)));

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { actor: { select: { email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    return apiSuccess(logs, 200, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/audit-logs');
  }
}
