import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { CustomerTable } from '@/components/customers/customer-table';
import { listCustomers } from '@/server/services/customers';

export const dynamic = 'force-dynamic';

interface CustomersPageProps {
  searchParams: {
    search?: string;
    status?: string;
    page?: string;
  };
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const page = Number(searchParams.page ?? 1);
  const data = await listCustomers({
    search: searchParams.search,
    isBlacklisted: searchParams.status,
    page,
    pageSize: 10
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your tenant customer directory."
        actions={
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="h-4 w-4" /> Create customer
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
            placeholder="Search by name, phone, or address"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All customers</option>
          <option value="true">Blacklisted</option>
          <option value="false">Active</option>
        </select>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>

      <CustomerTable customers={data.items} totalPages={data.totalPages} currentPage={data.page} basePath="/customers" />
    </div>
  );
}
