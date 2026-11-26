import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/server/permissions/auth';
import { apiSuccess, handleUnexpectedError } from '@/server/http/response';

export async function GET() {
  try {
    const authRes = await requireAdmin();
    if ('error' in authRes) return authRes.error;

    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    return apiSuccess(flags);
  } catch (err) {
    return handleUnexpectedError(err, 'GET /api/v1/admin/feature-flags');
  }
}
