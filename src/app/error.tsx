'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled application error:', error.digest || error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-[#EF4444]">500 Error</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-[var(--muted-foreground)]">
        An unexpected error occurred while rendering this page. Your local editor inputs are not
        transmitted on error.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D28D9]"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </main>
  );
}
