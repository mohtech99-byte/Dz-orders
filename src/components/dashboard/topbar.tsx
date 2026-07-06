'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export function DashboardTopbar() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back</p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">DZ Orders dashboard</h2>
      </div>
      <ThemeToggle />
    </div>
  );
}
