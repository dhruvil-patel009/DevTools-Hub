'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, Star, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { getAllTools } from '@/lib/tool-registry/tools';
import { ToolIcon } from '@/components/shared/ToolIcon';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, localFavorites, recentToolSlugs } = useWorkspaceStore();
  const tools = getAllTools();

  const favoriteTools = localFavorites
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const recentTools = recentToolSlugs
    .slice(0, 5)
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-[var(--border)] bg-[var(--card)]/50 transition-all duration-200 lg:flex lg:flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Workspace navigation"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-3">
        {!sidebarCollapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Workspace
          </span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-2.5 py-4">
        {!sidebarCollapsed && favoriteTools.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Favorites
            </div>
            <ul className="space-y-1">
              {favoriteTools.map((tool) => (
                <li key={`fav-${tool.id}`}>
                  <Link
                    href={tool.route}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                      pathname === tool.route
                        ? 'bg-[#7C3AED]/15 font-medium text-[#A78BFA]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <ToolIcon name={tool.icon} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tool.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!sidebarCollapsed && recentTools.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <Clock className="h-3.5 w-3.5 text-[#06B6D4]" />
              Recently Used
            </div>
            <ul className="space-y-1">
              {recentTools.map((tool) => (
                <li key={`rec-${tool.id}`}>
                  <Link
                    href={tool.route}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                      pathname === tool.route
                        ? 'bg-[#7C3AED]/15 font-medium text-[#A78BFA]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <ToolIcon name={tool.icon} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tool.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          {!sidebarCollapsed && (
            <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <Layers className="h-3.5 w-3.5 text-[#7C3AED]" />
              Categories
            </div>
          )}
          <ul className="space-y-1">
            {TOOL_CATEGORIES.filter((c) => c.isActive).map((cat) => {
              const href = `/tools/${cat.slug}`;
              const active = pathname.startsWith(href);
              return (
                <li key={cat.id}>
                  <Link
                    href={href}
                    title={sidebarCollapsed ? cat.name : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      sidebarCollapsed && 'justify-center px-0',
                      active
                        ? 'bg-[#7C3AED]/15 font-medium text-[#A78BFA]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <ToolIcon name={cat.icon} className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{cat.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
