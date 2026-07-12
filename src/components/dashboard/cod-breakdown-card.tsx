import { EmptyState } from '@/components/shared/empty-state';
import type { DashboardCodBreakdown } from '@/server/services/dashboard';

interface CodBreakdownCardProps {
  data: DashboardCodBreakdown | null;
}

export function CodBreakdownCard({ data }: CodBreakdownCardProps) {
  const totalOrders = data ? data.codOrders + data.prepaidOrders : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">COD vs prepaid</h3>
        <p className="text-sm text-muted-foreground">How much of your business relies on cash on delivery.</p>
      </div>

      {!data || totalOrders === 0 ? (
        <EmptyState title="No orders yet" description="The COD vs prepaid mix will appear once orders start coming in." />
      ) : (
        <div className="space-y-3">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-hover">
            <div className="h-full bg-amber-500" style={{ width: `${data.codPercentage}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${100 - data.codPercentage}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Cash on delivery
              </div>
              <p className="mt-1 text-muted-foreground">
                {data.codOrders.toLocaleString()} orders · {data.codRevenue.toLocaleString()} DZD
              </p>
              <p className="text-xs text-muted-foreground">{data.codPercentage}% of orders</p>
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Prepaid
              </div>
              <p className="mt-1 text-muted-foreground">
                {data.prepaidOrders.toLocaleString()} orders · {data.prepaidRevenue.toLocaleString()} DZD
              </p>
              <p className="text-xs text-muted-foreground">{100 - data.codPercentage}% of orders</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
