import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[#7C3AED]">
        <FileQuestion className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-[#06B6D4]">404 Error</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-[var(--muted-foreground)]">
        The developer tool or page you requested does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D28D9]"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]"
        >
          <Search className="h-4 w-4" />
          Explore Tools
        </Link>
      </div>
    </main>
  );
}
