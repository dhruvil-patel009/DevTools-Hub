'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, LogOut, Menu, Search, User } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Button } from '@/components/ui/button';

export function TopNav({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const setCommandPaletteOpen = useWorkspaceStore((s) => s.setCommandPaletteOpen);
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <BrandLogo className="h-8 w-8 shrink-0 shadow-sm" />
            <span className="text-base font-bold">
              DevTools <span className="text-[#06B6D4]">Hub</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-5 text-sm font-medium md:flex" aria-label="Primary">
            <Link
              href="/tools"
              className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Tools
            </Link>
            <Link
              href="/#categories"
              className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[#7C3AED]/50 hover:text-[var(--foreground)] sm:w-56 md:w-64 cursor-pointer"
            aria-label="Search tools (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden flex-1 text-left sm:inline">Search tools...</span>
            <kbd className="hidden rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
              Ctrl K
            </kbd>
          </button>

          <ThemeToggle />

          {status === 'authenticated' && session?.user ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" title={session.user.email ?? 'Dashboard'}>
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#06B6D4]" />
                  {session.user.name?.split(' ')[0] || 'Dashboard'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <User className="h-3.5 w-3.5" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
