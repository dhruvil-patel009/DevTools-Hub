'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json?.error?.message || 'Registration failed.');
      } else {
        toast.success('Account created! You can now sign in.');
        router.push('/login');
      }
    } catch {
      toast.error('Network error during registration.');
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
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Free developer workspace — core tools always remain open without login.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium">
              Full Name
            </label>
            <Input
              id="reg-name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@example.com"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium">
              Password (min. 8 characters)
            </label>
            <Input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#A78BFA] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
