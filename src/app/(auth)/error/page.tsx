import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <ShieldAlert className="mx-auto h-10 w-10 text-[#EF4444]" />
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          We could not complete your sign-in request. Please verify your credentials or try again.
        </p>
        <Link href="/login" className="inline-block">
          <Button>Return to Sign In</Button>
        </Link>
      </div>
    </main>
  );
}
