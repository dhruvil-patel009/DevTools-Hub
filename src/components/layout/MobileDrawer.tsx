'use client';

import * as React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { ToolIcon } from '@/components/shared/ToolIcon';

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--card)] p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 font-bold">
            <BrandLogo className="h-7 w-7" />
            DevTools Hub
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-5 overflow-y-auto">
          <div className="space-y-1">
            <Link
              href="/tools"
              onClick={onClose}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              All Developer Tools
            </Link>
            <Link
              href="/dashboard"
              onClick={onClose}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              onClick={onClose}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[#A78BFA] hover:bg-[var(--muted)]"
            >
              Sign In
            </Link>
          </div>

          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Categories
            </p>
            <ul className="space-y-1">
              {TOOL_CATEGORIES.filter((c) => c.isActive).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/tools/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <ToolIcon name={cat.icon} className="h-4 w-4 text-[#7C3AED]" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
