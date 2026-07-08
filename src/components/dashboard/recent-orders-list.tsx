import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';
import type { DashboardRecentOrderItem } from '@/server/services/dashboard';

interface RecentOrdersListProps {
  orders: DashboardRecentOrderItem[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent orders</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">The latest activity for the selected period.</p>
        </div>
        <Link href="/orders" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Create your first order to see it show up here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-medium text-slate-900 hover:underline dark:text-slate-100">
                      {order.orderNumber}
                    </Link>
                    <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{order.total.toLocaleString()} DZD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
