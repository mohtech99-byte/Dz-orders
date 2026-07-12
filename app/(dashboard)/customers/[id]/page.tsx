import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ShieldAlert, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { deleteCustomerAction, toggleCustomerBlacklistAction } from '@/server/actions/customers';
import { getCustomer, getCustomerOrderStats } from '@/server/services/customers';

export const dynamic = 'force-dynamic';

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);

  if (!customer) {
    notFound();
  }

  const stats = await getCustomerOrderStats(customer.id);
  const isRisky = !customer.isBlacklisted && stats.totalOrders >= 2 && stats.cancellationRate >= 40;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.fullName}
        description="Customer profile and contact details."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/customers/${customer.id}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <form action={deleteCustomerAction.bind(null, customer.id)}>
              <Button type="submit" variant="danger">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </form>
          </>
        }
      />

      {customer.isBlacklisted ? (
        <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-bg p-4 text-sm text-danger">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">This customer is blacklisted</p>
            {customer.blacklistReason ? <p className="mt-0.5 opacity-90">Reason: {customer.blacklistReason}</p> : null}
            <p className="mt-0.5 text-xs opacity-75">
              {customer.blacklistedBy?.name ?? 'Unknown'} ·{' '}
              {customer.blacklistedAt ? new Date(customer.blacklistedAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
      ) : isRisky ? (
        <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning-bg p-4 text-sm text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Risky order history</p>
            <p className="mt-0.5 opacity-90">
              {stats.cancelledOrders + stats.returnedOrders} of {stats.totalOrders} orders were cancelled or returned (
              {stats.cancellationRate}%). Consider reviewing before accepting more COD orders.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <dl className="grid gap-4 md:grid-cols-2">
            <MetaItem label="Phone" value={<span className="font-data">{customer.phone}</span>} />
            <MetaItem label="Alternative phone" value={customer.altPhone ? <span className="font-data">{customer.altPhone}</span> : '—'} />
            <MetaItem label="Wilaya" value={customer.wilaya.nameFr} />
            <MetaItem label="Commune" value={customer.commune.nameFr} />
            <MetaItem label="Address" value={customer.address} />
            <MetaItem
              label="Status"
              value={
                customer.isBlacklisted ? (
                  <Badge tone="danger" dot>
                    Blacklisted
                  </Badge>
                ) : (
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                )
              }
            />
            <div className="md:col-span-2">
              <MetaItem label="Notes" value={customer.notes ?? '—'} />
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Order history</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Total orders</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{stats.totalOrders}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Delivered</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-success">{stats.deliveredOrders}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cancelled</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-danger">{stats.cancelledOrders}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Returned</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-warning">{stats.returnedOrders}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Blacklist</h3>
            {customer.isBlacklisted ? (
              <form action={toggleCustomerBlacklistAction.bind(null, customer.id)} className="mt-3">
                <input type="hidden" name="isBlacklisted" value="true" />
                <Button type="submit" variant="primary" className="w-full">
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
                  className="flex min-h-16 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <Button type="submit" variant="danger" className="w-full">
                  <ShieldAlert className="h-4 w-4" /> Blacklist this customer
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
