import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { deleteCustomerAction } from '@/server/actions/customers';
import { getCustomer } from '@/server/services/customers';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={customer.fullName} description="Customer profile and contact details." />
        <div className="flex gap-2">
          <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
          </Button>
          <form action={deleteCustomerAction.bind(null, customer.id)}>
            <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-500">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Phone</dt>
            <dd className="mt-1 text-sm">{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Alternative phone</dt>
            <dd className="mt-1 text-sm">{customer.altPhone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Wilaya</dt>
            <dd className="mt-1 text-sm">{customer.wilaya.nameFr}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Commune</dt>
            <dd className="mt-1 text-sm">{customer.commune.nameFr}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Address</dt>
            <dd className="mt-1 text-sm">{customer.address}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-1 text-sm">{customer.isBlacklisted ? 'Blacklisted' : 'Active'}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-slate-500">Notes</dt>
            <dd className="mt-1 text-sm">{customer.notes ?? '—'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
