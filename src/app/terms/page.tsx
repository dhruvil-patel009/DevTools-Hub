import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for DevTools Hub.',
};

export default function TermsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
          <p>
            DevTools Hub utilities are provided as-is for developer productivity. Always verify
            critical cryptographic, security, and production outputs independently.
          </p>
          <p>
            Do not submit confidential, regulated, or proprietary secrets to optional external AI
            features.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
