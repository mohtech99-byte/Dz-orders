import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import { OrderStatusBadge } from '@/components/ui/badge';
import type { DashboardRecentOrderItem } from '@/server/services/dashboard';

interface RecentOrdersListProps {
  orders: DashboardRecentOrderItem[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent orders</h3>
          <p className="text-sm text-muted-foreground">The latest activity for the selected period.</p>
        </div>
        <Link href="/orders" className="text-sm font-medium text-primary hover:text-primary-hover">
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Create your first order to see it show up here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-hover">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-data font-medium text-foreground hover:text-primary">
                      {order.orderNumber}
                    </Link>
                    <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{order.customerName}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{order.total.toLocaleString()} DZD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
