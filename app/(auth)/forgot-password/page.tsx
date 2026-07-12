'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      setError('Please enter a valid email address.');
      return;
    }

    setMessage(data.message || 'If that email exists, we sent reset instructions.');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-10 shadow-elevated">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">We’ll send a secure reset link to your inbox.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <Button type="submit">Send reset link</Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
