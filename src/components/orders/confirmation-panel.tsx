import { PhoneCall, Clock, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logOrderCallAttemptAction, assignOrderAgentAction } from '@/server/actions/orders';

interface Agent {
  id: string;
  name: string;
}

interface ConfirmationPanelProps {
  orderId: string;
  status: string;
  confirmationAttempts: number;
  nextCallAt: Date | null;
  assignedAgent: { id: string; name: string | null } | null;
  agents: Agent[];
}

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ConfirmationPanel({ orderId, status, confirmationAttempts, nextCallAt, assignedAgent, agents }: ConfirmationPanelProps) {
  const isAwaitingConfirmation = status === 'NEW' || status === 'CALLING';
  const isOverdue = nextCallAt ? nextCallAt.getTime() < Date.now() : false;

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Confirmation</h3>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {confirmationAttempts} {confirmationAttempts === 1 ? 'attempt' : 'attempts'}
        </span>
      </div>

      {nextCallAt ? (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
            isOverdue
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300'
              : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          {isOverdue ? 'Follow-up overdue since' : 'Next call scheduled for'} {new Date(nextCallAt).toLocaleString()}
        </div>
      ) : null}

      {/* Agent assignment */}
      <form action={assignOrderAgentAction.bind(null, orderId)} className="flex items-end gap-2">
        <label className="flex-1 space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <UserCircle2 className="h-3.5 w-3.5" /> Assigned agent
          </span>
          <select
            name="agentId"
            defaultValue={assignedAgent?.id ?? ''}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="submit"
          className="h-9 bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Save
        </Button>
      </form>

      {isAwaitingConfirmation ? (
        <form action={logOrderCallAttemptAction.bind(null, orderId)} className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <PhoneCall className="h-4 w-4" /> Call the customer, then log the outcome.
          </p>

          <select
            name="outcome"
            defaultValue="NO_ANSWER"
            required
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <optgroup label="No resolution yet">
              <option value="NO_ANSWER">No answer</option>
              <option value="BUSY">Busy</option>
              <option value="PHONE_OFF">Phone off</option>
              <option value="WRONG_NUMBER">Wrong number</option>
              <option value="REFUSED">Refused to confirm</option>
              <option value="DUPLICATE">Duplicate order</option>
              <option value="RESCHEDULED">Reschedule call</option>
              <option value="CALLBACK_REQUESTED">Customer requested callback</option>
            </optgroup>
            <optgroup label="Final outcome">
              <option value="CONFIRMED">Confirmed by customer</option>
              <option value="CANCELLED">Cancel order</option>
            </optgroup>
          </select>

          <label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            Cancellation reason (only used if outcome is &ldquo;Cancel order&rdquo;)
            <select
              name="cancellationReason"
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">—</option>
              <option value="CUSTOMER_REFUSED">Customer refused</option>
              <option value="WRONG_NUMBER">Wrong number</option>
              <option value="DUPLICATE_ORDER">Duplicate order</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
              <option value="FRAUD_SUSPECTED">Fraud suspected</option>
              <option value="CHANGED_MIND">Customer changed mind</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            Schedule next call (only used for reschedule / callback outcomes)
            <input
              type="datetime-local"
              name="nextCallAt"
              min={toDateTimeLocalValue(new Date())}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <textarea
            name="note"
            rows={2}
            placeholder="Optional note (e.g. asked to call back tomorrow)"
            className="flex min-h-16 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />

          <Button type="submit">Log call attempt</Button>
        </form>
      ) : (
        <p className="border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          This order has moved past confirmation. Use the workflow panel to update its fulfillment status.
        </p>
      )}
    </div>
  );
}
