import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Auth - DZ Orders'
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">{children}</div>;
}
