import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About & Documentation',
  description: 'Learn how DevTools Hub works, its privacy-first architecture, and keyboard shortcuts.',
};

export default function AboutPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <article className="prose prose-invert max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">About DevTools Hub</h1>
        <p className="text-[var(--muted-foreground)]">
          DevTools Hub is a modular, full-stack developer utility workspace designed around speed,
          privacy, and clean ergonomics.
        </p>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-2">
          <h2 className="text-xl font-semibold">Creator</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Built and maintained by{' '}
            <span className="font-semibold text-[var(--foreground)]">{siteConfig.author}</span>.
            Source code is available on{' '}
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06B6D4] hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
          <h2 className="text-xl font-semibold">Privacy-First Execution</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            All 47 core developer tools run locally in your browser. Passwords, JWTs, API keys, and
            raw inputs are never logged or stored in analytics. Optional AI tools require explicit
            consent before sending code to the server-side Gemini integration.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>
              <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 font-mono text-xs">
                Ctrl / Cmd + K
              </kbd>{' '}
              — Open global tool search palette
            </li>
            <li>
              <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 font-mono text-xs">
                Escape
              </kbd>{' '}
              — Close modals or exit full-screen editor
            </li>
          </ul>
        </section>
      </article>
    </AppShell>
  );
}
