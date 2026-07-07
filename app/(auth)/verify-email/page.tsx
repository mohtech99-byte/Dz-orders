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
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Verify email</h1>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {status === 'loading' ? <p className="mt-4 text-sm text-slate-500">Verifying your email...</p> : null}
      <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/login" className="font-medium text-slate-900 dark:text-slate-100">
          Continue to sign in
        </Link>
      </p>
    </div>
  );
}
