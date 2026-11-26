'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Star, Clock, ArrowRight } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { getAllTools } from '@/lib/tool-registry/tools';
import { CATEGORY_MAP } from '@/lib/tool-registry/categories';
import { ToolIcon } from '@/components/shared/ToolIcon';

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, localFavorites, recentToolSlugs } =
    useWorkspaceStore();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const tools = getAllTools();
  const recentTools = recentToolSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const navigate = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-xs"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Global tool search"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Search developer tools" className="w-full">
          <div className="flex items-center border-b border-[var(--border)] px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            <Command.Input
              autoFocus
              placeholder="Search 50+ tools (e.g. json, regex, base64, jwt, gradient)..."
              className="flex h-12 w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <kbd className="hidden rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] sm:inline-block">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No matching developer tools found.
            </Command.Empty>

            {recentTools.length > 0 && (
              <Command.Group
                heading="Recently Used"
                className="px-2 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                {recentTools.map((tool) => (
                  <Command.Item
                    key={`recent-${tool.id}`}
                    value={`recent ${tool.name} ${tool.keywords.join(' ')}`}
                    onSelect={() => navigate(tool.route)}
                    className="mt-1 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[#7C3AED]/15 aria-selected:text-[#A78BFA]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-3.5 w-3.5 text-[#06B6D4]" />
                      <ToolIcon name={tool.icon} className="h-4 w-4" />
                      <span className="font-medium">{tool.name}</span>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {CATEGORY_MAP[tool.category].name}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group
              heading="All Developer Tools"
              className="px-2 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]"
            >
              {tools.map((tool) => {
                const isFav = localFavorites.includes(tool.slug);
                return (
                  <Command.Item
                    key={tool.id}
                    value={`${tool.name} ${tool.category} ${tool.keywords.join(' ')} ${tool.description}`}
                    onSelect={() => navigate(tool.route)}
                    className="mt-1 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--foreground)] aria-selected:bg-[#7C3AED]/15 aria-selected:text-[#A78BFA]"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <ToolIcon name={tool.icon} className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                      <div className="truncate">
                        <span className="font-medium">{tool.name}</span>
                        <span className="ml-2 hidden text-xs text-[var(--muted-foreground)] sm:inline">
                          {CATEGORY_MAP[tool.category].name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFav && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                      <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
