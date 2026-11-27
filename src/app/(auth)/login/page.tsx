'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error('Invalid email or password.');
      } else {
        toast.success('Signed in successfully.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg">
            <BrandLogo className="h-9 w-9" />
            DevTools Hub
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to your workspace</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sync favorites, saved snippets, and API collections.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-[var(--muted-foreground)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[#A78BFA] hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
