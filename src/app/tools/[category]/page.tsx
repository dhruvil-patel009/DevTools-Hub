import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ToolCard } from '@/components/tools/ToolCard';
import { TOOL_CATEGORIES, getCategoryBySlug } from '@/lib/tool-registry/categories';
import { getToolsByCategory } from '@/lib/tool-registry/tools';
import { ToolIcon } from '@/components/shared/ToolIcon';

export function generateStaticParams() {
  return TOOL_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return { title: 'Category Not Found' };
  return {
    title: `${cat.name} — Developer Utilities`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat || !cat.isActive) notFound();

  const tools = getToolsByCategory(cat.slug);

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: cat.name },
        ]}
      />

      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/15 text-[#A78BFA]">
          <ToolIcon name={cat.icon} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cat.name}</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">{cat.description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </AppShell>
  );
}
