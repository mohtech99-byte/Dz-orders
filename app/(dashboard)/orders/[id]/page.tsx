import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldAlert, Truck, CheckCircle2, Info, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/ui/badge';
import { ConfirmationPanel } from '@/components/orders/confirmation-panel';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { deleteOrderAction, updateOrderStatusAction } from '@/server/actions/orders';
import { createShipmentAction, setManualTrackingAction } from '@/server/actions/delivery';
import { getOrder, getOrderTimeline, getOrganizationAgents } from '@/server/services/orders';

export const dynamic = 'force-dynamic';

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { shipment?: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  const [timeline, agents] = await Promise.all([getOrderTimeline(order.id), getOrganizationAgents()]);
  const isAwaitingConfirmation = order.status === 'NEW' || order.status === 'CALLING';

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description="Order summary, delivery details, and fulfillment updates."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/orders/${order.id}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <form action={deleteOrderAction.bind(null, order.id)}>
              <Button type="submit" variant="danger">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </form>
          </>
        }
      />

      {order.customer?.isBlacklisted ? (
        <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-bg p-4 text-sm text-danger">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">This customer is blacklisted</p>
            {order.customer.blacklistReason ? <p className="mt-0.5 opacity-90">Reason: {order.customer.blacklistReason}</p> : null}
            <Link href={`/customers/${order.customer.id}`} className="mt-1 inline-block text-xs underline opacity-90">
              View customer profile
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Summary</h3>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MetaItem label="Customer" value={order.customer?.fullName ?? order.phoneSnapshot} />
            <MetaItem label="Phone" value={<span className="font-data">{order.phoneSnapshot}</span>} />
            <MetaItem label="Location" value={`${order.wilaya.nameFr} / ${order.commune.nameFr}`} />
            <MetaItem label="Payment" value={order.paymentMethod} />
            <MetaItem label="Delivery" value={order.deliveryType} />
            <MetaItem label="Confirmation attempts" value={order.confirmationAttempts} />
            <MetaItem label="Assigned agent" value={order.assignedAgent?.name ?? 'Unassigned'} />
            {order.nextCallAt ? <MetaItem label="Next call" value={new Date(order.nextCallAt).toLocaleString()} /> : null}
            {order.cancellationReason ? <MetaItem label="Cancellation reason" value={order.cancellationReason} /> : null}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <span className="text-foreground">
                    {item.productNameSnapshot} <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums text-foreground">{item.lineTotal.toLocaleString()} DZD</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 space-y-1.5 border-t border-border pt-6 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{order.subtotal.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery cost</span>
              <span className="tabular-nums">{order.deliveryCost.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="tabular-nums">-{order.discount.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{order.total.toLocaleString()} DZD</span>
            </div>
            {order.notes ? <p className="pt-3 text-muted-foreground">Notes: {order.notes}</p> : null}
          </div>
        </Card>

        <div className="space-y-6">
          <ConfirmationPanel
            orderId={order.id}
            status={order.status}
            confirmationAttempts={order.confirmationAttempts}
            nextCallAt={order.nextCallAt}
            assignedAgent={order.assignedAgent}
            agents={agents}
          />

          {!isAwaitingConfirmation ? (
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Workflow</h3>
              <form action={updateOrderStatusAction.bind(null, order.id)} className="mt-4 space-y-3">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
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
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Add a note for this status change"
                  className="flex min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <Button type="submit">Update status</Button>
              </form>
            </Card>
          ) : null}

          {order.status === 'READY_TO_SHIP' || order.status === 'PACKED' || order.trackingNumber ? (
            <Card>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Truck className="h-4 w-4" /> Shipment
              </h3>

              {searchParams.shipment === 'manual' ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-info/20 bg-info-bg p-3 text-xs text-info">
                  <Info className="h-4 w-4 shrink-0" />
                  No API connection for this delivery company yet. Book the shipment with them directly, then enter the tracking number
                  below.
                </p>
              ) : null}
              {searchParams.shipment === 'error' ? (
                <p className="mt-3 rounded-lg border border-danger/20 bg-danger-bg p-3 text-xs text-danger">
                  Something went wrong creating the shipment. You can enter the tracking number manually below.
                </p>
              ) : null}

              {order.trackingNumber ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-foreground">
                    Tracking: <span className="font-data font-medium">{order.trackingNumber}</span>
                  </span>
                </div>
              ) : !order.deliveryCompanyId ? (
                <p className="mt-3 text-sm text-muted-foreground">Select a delivery company on this order to book a shipment.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  <form action={createShipmentAction.bind(null, order.id)}>
                    <Button type="submit">Create shipment with {order.deliveryCompany?.name}</Button>
                  </form>
                  <form action={setManualTrackingAction.bind(null, order.id)} className="flex items-center gap-2">
                    <input
                      name="trackingNumber"
                      placeholder="Or enter tracking number manually"
                      className="h-9 flex-1 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="h-9">
                      Save
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          ) : null}

          <OrderTimeline events={timeline} />
        </div>
      </div>
    </div>
  );
}
