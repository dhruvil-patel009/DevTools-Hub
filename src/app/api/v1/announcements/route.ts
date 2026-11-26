import { apiSuccess } from '@/server/http/response';
import { isDatabaseConfigured } from '@/config/env';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return apiSuccess([]);
  }

  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return apiSuccess(announcements);
  } catch {
    return apiSuccess([]);
  }
}
