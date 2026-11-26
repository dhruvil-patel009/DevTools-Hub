import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/features/landing/LandingPage';
import { buildWebsiteJsonLd } from '@/lib/seo/metadata';
import { isDatabaseConfigured } from '@/config/env';
import { prisma } from '@/lib/database/prisma';

export const dynamic = 'force-dynamic';

async function getPopularTools(): Promise<Array<{ slug: string; count: number }>> {
  if (!isDatabaseConfigured()) return [];
  try {
    const grouped = await prisma.toolUsage.groupBy({
      by: ['toolId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 4,
    });
    if (grouped.length === 0) return [];
    const tools = await prisma.tool.findMany({
      where: { id: { in: grouped.map((g) => g.toolId) }, isActive: true },
      select: { id: true, slug: true },
    });
    const slugMap = new Map(tools.map((t) => [t.id, t.slug]));
    return grouped
      .map((g) => {
        const slug = slugMap.get(g.toolId);
        return slug ? { slug, count: g._count.id } : null;
      })
      .filter((x): x is { slug: string; count: number } => Boolean(x));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const popularToolSlugs = await getPopularTools();
  const websiteJsonLd = buildWebsiteJsonLd();

  return (
    <AppShell showSidebar={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <LandingPage popularToolSlugs={popularToolSlugs} />
    </AppShell>
  );
}
