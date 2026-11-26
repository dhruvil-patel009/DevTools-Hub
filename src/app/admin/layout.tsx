import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity,
  Flag,
  MessageSquare,
  Shield,
  Users,
  Wrench,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getSessionActor } from '@/server/permissions/auth';

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getSessionActor();
  if (!actor) redirect('/login');
  if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: Shield },
    { href: '/admin/tools', label: 'Tools', icon: Wrench },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: Activity },
    { href: '/admin/settings', label: 'Flags & Settings', icon: Flag },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Role: {actor.role} • Sensitive changes are recorded in audit logs
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium hover:border-[#7C3AED]/60"
              >
                <item.icon className="h-3.5 w-3.5 text-[#06B6D4]" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {children}
      </div>
    </AppShell>
  );
}
