import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bookmark, Code2, FolderGit2, LayoutDashboard, Settings } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getSessionActor } from '@/server/permissions/auth';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getSessionActor();
  if (!actor) {
    redirect('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/snippets', label: 'Saved Snippets', icon: Code2 },
    { href: '/dashboard/collections', label: 'API Collections', icon: FolderGit2 },
    { href: '/dashboard/settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Developer Dashboard</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Signed in as {actor.email} ({actor.role})
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Dashboard sections">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium hover:border-[#7C3AED]/60"
              >
                <item.icon className="h-3.5 w-3.5 text-[#7C3AED]" />
                {item.label}
              </Link>
            ))}
            {(actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN') && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#6D28D9]"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {children}
      </div>
    </AppShell>
  );
}
