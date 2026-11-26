'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { getAllTools, searchTools } from '@/lib/tool-registry/tools';
import { ToolCard } from '@/components/tools/ToolCard';
import { Input } from '@/components/ui/input';
import type { CategorySlug } from '@/types/tool';
import { cn } from '@/lib/utils';

export function ToolsDirectoryClient() {
  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<CategorySlug | 'all'>('all');

  const filteredTools = React.useMemo(() => {
    const base = query.trim() ? searchTools(query) : getAllTools();
    if (selectedCategory === 'all') return base;
    return base.filter((t) => t.category === selectedCategory);
  }, [query, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {filteredTools.length} tools available — fast, privacy-first, and ready in your browser.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tools..."
            className="pl-9"
            aria-label="Filter developer tools"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
            selectedCategory === 'all'
              ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
              : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          All Categories
        </button>
        {TOOL_CATEGORIES.filter((c) => c.isActive).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
              selectedCategory === cat.slug
                ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filteredTools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            No tools matched &ldquo;{query}&rdquo;. Try another keyword.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
