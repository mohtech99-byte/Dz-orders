import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { OrderTable } from '@/components/orders/order-table';
import { listOrders } from '@/server/services/orders';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    page?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const page = Number(searchParams.page ?? 1);
  const data = await listOrders({
    search: searchParams.search,
    status: searchParams.status,
    paymentMethod: searchParams.paymentMethod,
    page,
    pageSize: 10
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Orders" description="Manage your store orders and fulfillment workflow." />
        <Button asChild>
          <Link href="/orders/new">Create order</Link>
        </Button>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-950" method="get">
        <input name="search" defaultValue={searchParams.search ?? ''} placeholder="Search by order number or phone" className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <select name="status" defaultValue={searchParams.status ?? ''} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="CALLING">Calling</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="READY_TO_SHIP">Ready to ship</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURNED">Returned</option>
        </select>
        <select name="paymentMethod" defaultValue={searchParams.paymentMethod ?? ''} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="">All payments</option>
          <option value="COD">Cash on delivery</option>
          <option value="PREPAID">Prepaid</option>
        </select>
        <Button type="submit">Apply</Button>
      </form>

      {data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No orders match your current filters.
        </div>
      ) : (
        <OrderTable orders={data.items} totalPages={data.totalPages} currentPage={data.page} basePath="/orders" />
      )}
    </div>
  );
}
