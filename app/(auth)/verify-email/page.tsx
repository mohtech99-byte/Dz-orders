'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Please check your inbox for a verification link.');

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      setStatus('loading');
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully.');
        return;
      }

      setStatus('error');
      setMessage(data.message || 'This verification link is invalid or has expired.');
    };

    verify();
  }, [token]);

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-10 shadow-elevated">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verify email</h1>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      {status === 'loading' ? <p className="mt-4 text-sm text-muted-foreground">Verifying your email...</p> : null}
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:text-primary">
          Continue to sign in
        </Link>
      </p>
    </div>
  );
}
