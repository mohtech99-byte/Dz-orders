import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
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
      <PageHeader
        title="Orders"
        description="Manage your store orders and fulfillment workflow."
        actions={
          <Button asChild>
            <Link href="/orders/new">
              <Plus className="h-4 w-4" /> Create order
            </Link>
          </Button>
        }
      />

      <form className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card md:flex-row" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="search"
            defaultValue={searchParams.search ?? ''}
            placeholder="Search by order number or phone"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
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
        <select
          name="paymentMethod"
          defaultValue={searchParams.paymentMethod ?? ''}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All payments</option>
          <option value="COD">Cash on delivery</option>
          <option value="PREPAID">Prepaid</option>
        </select>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>

      <OrderTable orders={data.items} totalPages={data.totalPages} currentPage={data.page} basePath="/orders" />
    </div>
  );
}
