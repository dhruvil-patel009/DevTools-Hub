'use client';

import * as React from 'react';
import Link from 'next/link';
import { Maximize2, Minimize2, Star, Bot, Cpu, HelpCircle, BookOpen } from 'lucide-react';
import type { ToolCategoryDefinition, ToolDefinition } from '@/types/tool';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ToolIcon } from '@/components/shared/ToolIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ToolWorkspace({
  tool,
  category,
  relatedTools,
  children,
}: {
  tool: ToolDefinition;
  category: ToolCategoryDefinition;
  relatedTools: ToolDefinition[];
  children: React.ReactNode;
}) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { localFavorites, toggleLocalFavorite, recordRecentTool } = useWorkspaceStore();
  const isFav = localFavorites.includes(tool.slug);

  React.useEffect(() => {
    recordRecentTool(tool.slug);
  }, [tool.slug, recordRecentTool]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/15 text-[#A78BFA]">
            <ToolIcon name={tool.icon} className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1>
              {tool.requiresAI ? (
                <Badge variant="cyan">
                  <Bot className="h-3 w-3" />
                  Optional AI
                </Badge>
              ) : (
                <Badge variant="success">
                  <Cpu className="h-3 w-3" />
                  Client-Side
                </Badge>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleLocalFavorite(tool.slug)}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('h-4 w-4', isFav && 'fill-amber-400 text-amber-400')} />
            {isFav ? 'Favorited' : 'Favorite'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen((v) => !v)}
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Tool Workspace */}
      <div
        className={cn(
          isFullscreen &&
            'fixed inset-0 z-50 overflow-y-auto bg-[var(--background)] p-4 sm:p-6'
        )}
      >
        {isFullscreen && (
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="font-semibold">{tool.name}</span>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="h-4 w-4" />
              Exit Fullscreen (Esc)
            </Button>
          </div>
        )}
        {children}
      </div>

      {/* Instructions, FAQs, and Related Tools */}
      <div className="grid gap-6 lg:grid-cols-3">
        {tool.instructions.length > 0 && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <BookOpen className="h-4 w-4 text-[#06B6D4]" />
              How to Use
            </h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-[var(--muted-foreground)]">
              {tool.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {tool.faqs.length > 0 && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <HelpCircle className="h-4 w-4 text-[#7C3AED]" />
              FAQ
            </h2>
            <div className="space-y-3">
              {tool.faqs.map((faq, i) => (
                <div key={i}>
                  <h3 className="text-sm font-medium">{faq.question}</h3>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedTools.length > 0 && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="mb-3 text-base font-semibold">Related {category.name}</h2>
            <ul className="space-y-2">
              {relatedTools.map((rel) => (
                <li key={rel.id}>
                  <Link
                    href={rel.route}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)]/60 px-3 py-2 text-sm transition-colors hover:border-[#7C3AED]/60 hover:bg-[var(--muted)]/50"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <ToolIcon name={rel.icon} className="h-4 w-4 text-[#7C3AED]" />
                      {rel.name}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">Open →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
