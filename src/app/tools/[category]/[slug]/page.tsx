import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ToolWorkspace } from '@/components/tools/ToolWorkspace';
import { ToolRenderer } from '@/components/tools/ToolRenderer';
import { getCategoryBySlug } from '@/lib/tool-registry/categories';
import { getAllTools, getRelatedTools, getToolBySlug } from '@/lib/tool-registry/tools';
import { buildToolJsonLd, buildToolMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return getAllTools().map((t) => ({
    category: t.category,
    slug: t.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || tool.category !== category || !tool.isActive) {
    return { title: 'Tool Not Found' };
  }
  return buildToolMetadata(tool);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);
  const cat = getCategoryBySlug(category);

  if (!tool || !cat || tool.category !== cat.slug || !tool.isActive || !cat.isActive) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool);
  const jsonLd = buildToolJsonLd(tool, cat);

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: cat.name, href: `/tools/${cat.slug}` },
          { label: tool.name },
        ]}
      />
      <ToolWorkspace tool={tool} category={cat} relatedTools={relatedTools}>
        <ToolRenderer componentKey={tool.componentKey} />
      </ToolWorkspace>
    </AppShell>
  );
}
