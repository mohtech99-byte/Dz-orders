import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';

export const dynamic = 'force-dynamic';
import { Button } from '@/components/ui/button';
import { CustomerTable } from '@/components/customers/customer-table';
import { listCustomers } from '@/server/services/customers';

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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Customers" description="Manage your tenant customer directory." />
        <Button asChild>
          <Link href="/customers/new">Create customer</Link>
        </Button>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-950" method="get">
        <input
          name="search"
          defaultValue={searchParams.search ?? ''}
          placeholder="Search by name, phone, or address"
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <select name="status" defaultValue={searchParams.status ?? ''} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="">All customers</option>
          <option value="true">Blacklisted</option>
          <option value="false">Active</option>
        </select>
        <Button type="submit">Apply</Button>
      </form>

      {data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No customers match your current filters.
        </div>
      ) : (
        <CustomerTable customers={data.items} totalPages={data.totalPages} currentPage={data.page} basePath="/customers" />
      )}
    </div>
  );
}
