import { PhoneCall, PhoneMissed, PhoneOff, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logOrderCallAttemptAction } from '@/server/actions/orders';

interface CallLogEntry {
  id: string;
  outcome: string;
  note: string | null;
  calledAt: Date;
  agent: { name: string | null } | null;
}

interface ConfirmationPanelProps {
  orderId: string;
  status: string;
  confirmationAttempts: number;
  callLogs: CallLogEntry[];
}

const OUTCOME_STYLE: Record<string, { icon: typeof PhoneCall; label: string; className: string }> = {
  CONFIRMED: { icon: PhoneCall, label: 'Confirmed', className: 'text-emerald-600 dark:text-emerald-400' },
  NO_ANSWER: { icon: PhoneMissed, label: 'No answer', className: 'text-amber-600 dark:text-amber-400' },
  CANCELLED: { icon: PhoneOff, label: 'Cancelled', className: 'text-rose-600 dark:text-rose-400' },
  RESCHEDULED: { icon: CalendarClock, label: 'Rescheduled', className: 'text-blue-600 dark:text-blue-400' }
};

export function ConfirmationPanel({ orderId, status, confirmationAttempts, callLogs }: ConfirmationPanelProps) {
  const isAwaitingConfirmation = status === 'NEW';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Confirmation</h3>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {confirmationAttempts} {confirmationAttempts === 1 ? 'attempt' : 'attempts'}
        </span>
      </div>

      {isAwaitingConfirmation ? (
        <form action={logOrderCallAttemptAction.bind(null, orderId)} className="mt-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">Call the customer, then log the outcome below.</p>
          <select
            name="outcome"
            defaultValue="NO_ANSWER"
            required
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="NO_ANSWER">No answer</option>
            <option value="CONFIRMED">Confirmed by customer</option>
            <option value="CANCELLED">Customer cancelled</option>
            <option value="RESCHEDULED">Reschedule call</option>
          </select>
          <textarea
            name="note"
            rows={2}
            placeholder="Optional note (e.g. asked to call back tomorrow)"
            className="flex min-h-16 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <Button type="submit">Log call attempt</Button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          This order has moved past confirmation. Use the workflow panel to update its fulfillment status.
        </p>
      )}

      {callLogs.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Call history</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {callLogs.map((log) => {
              const style = OUTCOME_STYLE[log.outcome] ?? OUTCOME_STYLE.NO_ANSWER;
              const Icon = style.icon;

              return (
                <li key={log.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                  <div className={`flex items-center gap-2 font-medium ${style.className}`}>
                    <Icon className="h-4 w-4" />
                    {style.label}
                    <span className="ml-auto text-xs font-normal text-slate-500">{new Date(log.calledAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Agent: {log.agent?.name ?? 'Unknown'}</div>
                  {log.note ? <div className="mt-1 text-slate-600 dark:text-slate-400">{log.note}</div> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
