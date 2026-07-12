import Link from 'next/link';
import { Eye, Pencil, PackageSearch } from 'lucide-react';
import { OrderStatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import type { Commune, Customer, DeliveryCompany, Order, Wilaya } from '@prisma/client';

interface OrderTableProps {
  orders: Array<Order & { customer: Customer | null; deliveryCompany: DeliveryCompany | null; wilaya: Wilaya; commune: Commune }>;
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function OrderTable({ orders, totalPages, currentPage, basePath }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No orders yet"
        description="Orders you create, or that come in through your public order form, will show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="sticky top-0 z-10 bg-surface-hover/80 backdrop-blur">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-hover">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`${basePath}/${order.id}`} className="font-data text-sm font-medium text-foreground hover:text-primary">
                      {order.orderNumber}
                    </Link>
                    <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{order.customer?.fullName ?? order.phoneSnapshot}</div>
                    <div className="font-data text-xs text-muted-foreground">{order.phoneSnapshot}</div>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">{order.total.toLocaleString()} DZD</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`${basePath}/${order.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="View order"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`${basePath}/${order.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="Edit order"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} basePath={basePath} />
    </div>
  );
}
