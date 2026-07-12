import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import '../globals.css';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { authOptions } from '@/lib/auth';
import { getOwnOrganization } from '@/server/services/organization';

export const metadata: Metadata = {
  title: 'Dashboard - DZ Orders'
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const organization = await getOwnOrganization();

  return (
    <DashboardShell orgName={organization.name} userName={session.user?.name ?? 'Account'} userEmail={session.user?.email ?? ''}>
      {children}
    </DashboardShell>
  );
}
