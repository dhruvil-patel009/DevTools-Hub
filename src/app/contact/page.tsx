import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FeedbackForm } from '@/features/landing/FeedbackForm';

export const metadata: Metadata = {
  title: 'Contact & Feedback',
  description: 'Send feedback, bug reports, or feature requests to DevTools Hub.',
};

export default function ContactPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact & Feedback' }]} />
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact & Feedback</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Report a bug, suggest a new developer utility, or share feedback.
          </p>
        </div>
        <FeedbackForm />
      </div>
    </AppShell>
  );
}
