'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Commune, Customer, DeliveryCompany, Order, Wilaya } from '@prisma/client';

interface OrderTableProps {
  orders: Array<Order & { customer: Customer | null; deliveryCompany: DeliveryCompany | null; wilaya: Wilaya; commune: Commune }>;
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function OrderTable({ orders, totalPages, currentPage, basePath }: OrderTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.orderNumber}</div>
                  <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.customer?.fullName ?? order.phoneSnapshot}</div>
                  <div className="text-xs text-slate-500">{order.phoneSnapshot}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{order.status}</span>
                </td>
                <td className="px-4 py-3">{order.total} DZD</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`${basePath}/${order.id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                      View
                    </Link>
                    <Link href={`${basePath}/${order.id}/edit`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</div>
          <div className="flex gap-2">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Link href={`${basePath}?page=${Math.max(1, currentPage - 1)}`}>Previous</Link>
            </Button>
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Link href={`${basePath}?page=${Math.min(totalPages, currentPage + 1)}`}>Next</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
