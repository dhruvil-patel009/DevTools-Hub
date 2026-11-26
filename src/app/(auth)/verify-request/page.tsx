import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <MailCheck className="mx-auto h-10 w-10 text-[#06B6D4]" />
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          A verification or sign-in link has been sent to your email address.
        </p>
        <Link href="/login" className="inline-block">
          <Button variant="outline">Back to Sign In</Button>
        </Link>
      </div>
    </main>
  );
}
