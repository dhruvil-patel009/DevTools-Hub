import { apiSuccess } from '@/server/http/response';
import { isAIConfigured, isDatabaseConfigured } from '@/config/env';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  let dbStatus: 'connected' | 'unconfigured' | 'error' = 'unconfigured';

  if (isDatabaseConfigured()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }
  }

  return apiSuccess({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      ai: isAIConfigured() ? 'configured' : 'unconfigured',
    },
  });
}
