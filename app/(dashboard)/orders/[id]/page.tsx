import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmationPanel } from '@/components/orders/confirmation-panel';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { deleteOrderAction, updateOrderStatusAction } from '@/server/actions/orders';
import { getOrder, getOrderTimeline, getOrganizationAgents } from '@/server/services/orders';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  const [timeline, agents] = await Promise.all([getOrderTimeline(order.id), getOrganizationAgents()]);
  const isAwaitingConfirmation = order.status === 'NEW' || order.status === 'CALLING';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader title={order.orderNumber} description="Order summary, delivery details, and fulfillment updates." />
        <div className="flex gap-2">
          <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            <Link href={`/orders/${order.id}/edit`}>Edit</Link>
          </Button>
          <form action={deleteOrderAction.bind(null, order.id)}>
            <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-500">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Customer</dt>
              <dd className="mt-1 text-sm">{order.customer?.fullName ?? order.phoneSnapshot}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm">{order.phoneSnapshot}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Location</dt>
              <dd className="mt-1 text-sm">
                {order.wilaya.nameFr} / {order.commune.nameFr}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Payment</dt>
              <dd className="mt-1 text-sm">{order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Delivery</dt>
              <dd className="mt-1 text-sm">{order.deliveryType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Status</dt>
              <dd className="mt-1 text-sm">{order.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Confirmation attempts</dt>
              <dd className="mt-1 text-sm">{order.confirmationAttempts}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Assigned agent</dt>
              <dd className="mt-1 text-sm">{order.assignedAgent?.name ?? 'Unassigned'}</dd>
            </div>
            {order.nextCallAt ? (
              <div>
                <dt className="text-sm font-medium text-slate-500">Next call</dt>
                <dd className="mt-1 text-sm">{new Date(order.nextCallAt).toLocaleString()}</dd>
              </div>
            ) : null}
            {order.cancellationReason ? (
              <div>
                <dt className="text-sm font-medium text-slate-500">Cancellation reason</dt>
                <dd className="mt-1 text-sm">{order.cancellationReason}</dd>
              </div>
            ) : null}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Items</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                  <span>
                    {item.productNameSnapshot} × {item.quantity}
                  </span>
                  <span>{item.lineTotal} DZD</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            <p>Subtotal: {order.subtotal} DZD</p>
            <p>Delivery cost: {order.deliveryCost} DZD</p>
            <p>Discount: {order.discount} DZD</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Total: {order.total} DZD</p>
            {order.notes ? <p className="mt-3">Notes: {order.notes}</p> : null}
          </div>
        </div>

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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Workflow</h3>
              <form action={updateOrderStatusAction.bind(null, order.id)} className="mt-4 space-y-3">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
                  className="flex min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <Button type="submit">Update status</Button>
              </form>
            </div>
          ) : null}

          <OrderTimeline events={timeline} />
        </div>
      </div>
    </div>
  );
}
