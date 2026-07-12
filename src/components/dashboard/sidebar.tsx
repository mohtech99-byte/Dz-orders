'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, ShoppingBag, BarChart3, Settings, Boxes } from 'lucide-react';
import clsx from 'clsx';
import { siteNav } from '@/config/nav';

const ICONS = {
  'layout-dashboard': LayoutDashboard,
  package: Package,
  users: Users,
  'shopping-bag': ShoppingBag,
  'bar-chart-3': BarChart3,
  settings: Settings
} as const;

export function DashboardSidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{orgName}</p>
          <p className="text-xs text-muted-foreground">DZ Orders</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {siteNav.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
              )}
            >
              {isActive ? <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" /> : null}
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 text-xs text-muted-foreground">Made for Algerian merchants 🇩🇿</div>
    </div>
  );
}
