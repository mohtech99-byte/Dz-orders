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
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Confirmation</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {confirmationAttempts} {confirmationAttempts === 1 ? 'attempt' : 'attempts'}
        </span>
      </div>

      {nextCallAt ? (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
            isOverdue
              ? 'border-danger/20 bg-danger-bg text-danger'
              : 'border-info/20 bg-info-bg text-info'
          }`}
        >
          <Clock className="h-4 w-4" />
          {isOverdue ? 'Follow-up overdue since' : 'Next call scheduled for'} {new Date(nextCallAt).toLocaleString()}
        </div>
      ) : null}

      {/* Agent assignment */}
      <form action={assignOrderAgentAction.bind(null, orderId)} className="flex items-end gap-2">
        <label className="flex-1 space-y-1 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <UserCircle2 className="h-3.5 w-3.5" /> Assigned agent
          </span>
          <select
            name="agentId"
            defaultValue={assignedAgent?.id ?? ''}
            className="flex h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary" size="sm" className="h-9">
          Save
        </Button>
      </form>

      {isAwaitingConfirmation ? (
        <form action={logOrderCallAttemptAction.bind(null, orderId)} className="space-y-3 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <PhoneCall className="h-4 w-4" /> Call the customer, then log the outcome.
          </p>

          <select
            name="outcome"
            defaultValue="NO_ANSWER"
            required
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

          <label className="block space-y-1 text-xs font-medium text-muted-foreground">
            Cancellation reason (only used if outcome is &ldquo;Cancel order&rdquo;)
            <select
              name="cancellationReason"
              defaultValue=""
              className="flex h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

          <label className="block space-y-1 text-xs font-medium text-muted-foreground">
            Schedule next call (only used for reschedule / callback outcomes)
            <input
              type="datetime-local"
              name="nextCallAt"
              min={toDateTimeLocalValue(new Date())}
              className="flex h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>

          <textarea
            name="note"
            rows={2}
            placeholder="Optional note (e.g. asked to call back tomorrow)"
            className="flex min-h-16 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />

          <Button type="submit">Log call attempt</Button>
        </form>
      ) : (
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
          This order has moved past confirmation. Use the workflow panel to update its fulfillment status.
        </p>
      )}
    </div>
  );
}
