import { EmptyState } from '@/components/shared/empty-state';
import type { DashboardCodBreakdown } from '@/server/services/dashboard';

interface CodBreakdownCardProps {
  data: DashboardCodBreakdown | null;
}

export function CodBreakdownCard({ data }: CodBreakdownCardProps) {
  const totalOrders = data ? data.codOrders + data.prepaidOrders : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">COD vs prepaid</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">How much of your business relies on cash on delivery.</p>
      </div>

      {!data || totalOrders === 0 ? (
        <EmptyState title="No orders yet" description="The COD vs prepaid mix will appear once orders start coming in." />
      ) : (
        <div className="space-y-3">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-amber-500" style={{ width: `${data.codPercentage}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${100 - data.codPercentage}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Cash on delivery
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {data.codOrders.toLocaleString()} orders · {data.codRevenue.toLocaleString()} DZD
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">{data.codPercentage}% of orders</p>
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Prepaid
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {data.prepaidOrders.toLocaleString()} orders · {data.prepaidRevenue.toLocaleString()} DZD
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">{100 - data.codPercentage}% of orders</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
