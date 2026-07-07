import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Auth - DZ Orders'
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">{children}</div>;
}
