import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for DevTools Hub.',
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          DevTools Hub is designed to minimize data collection. Client-side utilities process data
          strictly inside your browser.
        </p>
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">What we never collect</h2>
          <p>
            We never log, store, or track raw tool inputs, generated passwords, JWT tokens, private
            keys, or authorization headers.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Aggregate analytics</h2>
          <p>
            Tool execution analytics record only the tool identifier, success/failure boolean, and
            duration in milliseconds.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Account data</h2>
          <p>
            Registered users may export their saved data or permanently delete their account and
            associated records at any time from the User Dashboard.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
