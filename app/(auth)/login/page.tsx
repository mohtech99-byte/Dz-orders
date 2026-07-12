'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.ok) {
      router.push('/dashboard');
      return;
    }

    if (result?.error === 'EMAIL_NOT_VERIFIED') {
      setError('Please verify your email before signing in.');
      router.push('/verify-email');
      return;
    }

    setError('Invalid email or password.');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-10 shadow-elevated">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Access your store dashboard.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Sign in</Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-primary">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-primary">
          Create account
        </Link>
      </div>
    </div>
  );
}
