import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { deleteCustomerAction, toggleCustomerBlacklistAction } from '@/server/actions/customers';
import { getCustomer, getCustomerOrderStats } from '@/server/services/customers';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);

  if (!customer) {
    notFound();
  }

  const stats = await getCustomerOrderStats(customer.id);
  const isRisky = !customer.isBlacklisted && stats.totalOrders >= 2 && stats.cancellationRate >= 40;

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

      {customer.isBlacklisted ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">This customer is blacklisted</p>
            {customer.blacklistReason ? <p className="mt-0.5 opacity-90">Reason: {customer.blacklistReason}</p> : null}
            <p className="mt-0.5 text-xs opacity-75">
              {customer.blacklistedBy?.name ?? 'Unknown'} · {customer.blacklistedAt ? new Date(customer.blacklistedAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
      ) : isRisky ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Risky order history</p>
            <p className="mt-0.5 opacity-90">
              {stats.cancelledOrders + stats.returnedOrders} of {stats.totalOrders} orders were cancelled or returned ({stats.cancellationRate}%).
              Consider reviewing before accepting more COD orders.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Order history</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Total orders</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{stats.totalOrders}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Delivered</dt>
                <dd className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{stats.deliveredOrders}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Cancelled</dt>
                <dd className="mt-1 text-lg font-semibold text-rose-600 dark:text-rose-400">{stats.cancelledOrders}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Returned</dt>
                <dd className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.returnedOrders}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Blacklist</h3>
            {customer.isBlacklisted ? (
              <form action={toggleCustomerBlacklistAction.bind(null, customer.id)} className="mt-3">
                <input type="hidden" name="isBlacklisted" value="true" />
                <Button type="submit" className="flex w-full items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                  <ShieldCheck className="h-4 w-4" /> Remove from blacklist
                </Button>
              </form>
            ) : (
              <form action={toggleCustomerBlacklistAction.bind(null, customer.id)} className="mt-3 space-y-3">
                <input type="hidden" name="isBlacklisted" value="false" />
                <textarea
                  name="reason"
                  required
                  rows={2}
                  placeholder="Reason for blacklisting (required)"
                  className="flex min-h-16 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <Button type="submit" className="flex w-full items-center justify-center gap-2 bg-rose-600 text-white hover:bg-rose-500">
                  <ShieldAlert className="h-4 w-4" /> Blacklist this customer
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
