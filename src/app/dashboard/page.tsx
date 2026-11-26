import Link from 'next/link';
import { prisma } from '@/lib/database/prisma';
import { isDatabaseConfigured } from '@/config/env';
import { getSessionActor } from '@/server/permissions/auth';

export default async function DashboardOverviewPage() {
  const actor = await getSessionActor();
  if (!actor) return null;

  let favCount = 0;
  let snippetCount = 0;
  let collectionCount = 0;
  let aiUsedToday = 0;
  const aiDailyLimit = Number(process.env.AI_DAILY_LIMIT || 25);

  if (isDatabaseConfigured()) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    [favCount, snippetCount, collectionCount, aiUsedToday] = await Promise.all([
      prisma.favorite.count({ where: { userId: actor.id } }),
      prisma.savedSnippet.count({ where: { userId: actor.id } }),
      prisma.apiCollection.count({ where: { userId: actor.id } }),
      prisma.aIUsage.count({ where: { userId: actor.id, createdAt: { gte: startOfDay } } }),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted-foreground)]">Cloud Favorites</p>
          <p className="mt-2 text-2xl font-bold">{favCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted-foreground)]">Saved Snippets</p>
          <p className="mt-2 text-2xl font-bold">{snippetCount}</p>
          <Link href="/dashboard/snippets" className="mt-2 inline-block text-xs text-[#A78BFA] hover:underline">
            Manage snippets →
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted-foreground)]">API Collections</p>
          <p className="mt-2 text-2xl font-bold">{collectionCount}</p>
          <Link href="/dashboard/collections" className="mt-2 inline-block text-xs text-[#A78BFA] hover:underline">
            View collections →
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted-foreground)]">AI Quota Today</p>
          <p className="mt-2 text-2xl font-bold">
            {aiUsedToday} / {aiDailyLimit}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-base font-semibold">Privacy Reminder</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          DevTools Hub never saves raw tool inputs automatically. Only snippets, API collections
          (with credentials redacted), and preferences you explicitly save are stored.
        </p>
      </div>
    </div>
  );
}
