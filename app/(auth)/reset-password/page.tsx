'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Unable to reset password.');
      return;
    }

    setMessage(data.message || 'Password updated successfully.');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-10 shadow-elevated">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter a new password for your account.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <Button type="submit">Update password</Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
