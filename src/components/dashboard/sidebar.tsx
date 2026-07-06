'use client';

import Link from 'next/link';
import { siteNav } from '@/config/nav';

export function DashboardSidebar() {
  return (
    <aside className="w-72 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Menu</p>
          <nav className="mt-4 space-y-2">
            {siteNav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
