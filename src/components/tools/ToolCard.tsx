'use client';

import * as React from 'react';
import Link from 'next/link';
import { Star, Bot, Cpu } from 'lucide-react';
import type { ToolDefinition } from '@/types/tool';
import { CATEGORY_MAP } from '@/lib/tool-registry/categories';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ToolIcon } from '@/components/shared/ToolIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const { localFavorites, toggleLocalFavorite } = useWorkspaceStore();
  const isFav = localFavorites.includes(tool.slug);
  const category = CATEGORY_MAP[tool.category];

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[#7C3AED]/60 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link
            href={tool.route}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#7C3AED]/20 bg-[#7C3AED]/10 text-[#A78BFA] transition-colors group-hover:bg-[#7C3AED] group-hover:text-white"
          >
            <ToolIcon name={tool.icon} className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-1.5">
            {tool.requiresAI ? (
              <Badge variant="cyan" className="text-[10px]">
                <Bot className="h-3 w-3" />
                AI
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                <Cpu className="h-3 w-3" />
                Local
              </Badge>
            )}
            <button
              type="button"
              onClick={() => toggleLocalFavorite(tool.slug)}
              aria-label={isFav ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
              className="rounded-md p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-amber-400 cursor-pointer"
            >
              <Star className={cn('h-4 w-4', isFav && 'fill-amber-400 text-amber-400')} />
            </button>
          </div>
        </div>

        <Link href={tool.route} className="block">
          <h3 className="font-semibold text-[var(--foreground)] transition-colors group-hover:text-[#A78BFA]">
            {tool.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-[var(--muted-foreground)]">
            {tool.description}
          </p>
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/60 pt-3 text-xs text-[var(--muted-foreground)]">
        <Link href={`/tools/${category.slug}`} className="hover:text-[#06B6D4]">
          {category.name}
        </Link>
        <Link href={tool.route} className="font-medium text-[#7C3AED] hover:underline">
          Open →
        </Link>
      </div>
    </div>
  );
}
