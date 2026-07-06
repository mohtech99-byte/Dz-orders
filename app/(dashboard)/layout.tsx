import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import './globals.css';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard - DZ Orders'
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <main className="space-y-6 p-6">
          <DashboardTopbar />
          {children}
        </main>
      </div>
    </div>
  );
}
