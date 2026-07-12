'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { DashboardSidebar } from './sidebar';
import { DashboardTopbar } from './topbar';

interface DashboardShellProps {
  orgName: string;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function DashboardShell({ orgName, userName, userEmail, children }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <DashboardSidebar orgName={orgName} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-slide-up bg-surface shadow-elevated">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div onClick={() => setDrawerOpen(false)}>
              <DashboardSidebar orgName={orgName} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <DashboardTopbar userName={userName} userEmail={userEmail} onMenuClick={() => setDrawerOpen(true)} />
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
