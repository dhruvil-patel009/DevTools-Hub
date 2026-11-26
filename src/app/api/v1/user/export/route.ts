import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/server/permissions/auth';
import { apiSuccess } from '@/server/http/response';

export async function GET() {
  const authRes = await requireAuth();
  if ('error' in authRes) return authRes.error;

  const [user, preference, favorites, snippets, collections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: authRes.actor.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.userPreference.findUnique({ where: { userId: authRes.actor.id } }),
    prisma.favorite.findMany({
      where: { userId: authRes.actor.id },
      include: { tool: { select: { slug: true, name: true } } },
    }),
    prisma.savedSnippet.findMany({ where: { userId: authRes.actor.id } }),
    prisma.apiCollection.findMany({
      where: { userId: authRes.actor.id },
      include: { requests: true },
    }),
  ]);

  return apiSuccess({
    exportedAt: new Date().toISOString(),
    user,
    preference,
    favorites,
    snippets,
    collections,
  });
}
