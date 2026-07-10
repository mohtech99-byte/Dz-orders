import { PhoneCall, ArrowRightCircle } from 'lucide-react';
import type { OrderTimelineEvent } from '@/server/services/orders';

interface OrderTimelineProps {
  events: OrderTimelineEvent[];
}

const OUTCOME_LABEL: Record<string, string> = {
  NO_ANSWER: 'No answer',
  BUSY: 'Busy',
  PHONE_OFF: 'Phone off',
  WRONG_NUMBER: 'Wrong number',
  REFUSED: 'Refused to confirm',
  DUPLICATE: 'Duplicate order',
  RESCHEDULED: 'Rescheduled',
  CALLBACK_REQUESTED: 'Callback requested',
  CONFIRMED: 'Confirmed by customer',
  CANCELLED: 'Cancelled'
};

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        No activity recorded for this order yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Timeline</h3>

      <ol className="mt-4 space-y-4 border-l border-slate-200 pl-4 dark:border-slate-800">
        {events.map((event) => (
          <li key={`${event.type}-${event.id}`} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />

            {event.type === 'STATUS_CHANGE' ? (
              <div className="text-sm">
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                  <ArrowRightCircle className="h-4 w-4 text-slate-400" />
                  {event.fromStatus} → {event.toStatus}
                </div>
                {event.note ? <p className="mt-0.5 text-slate-600 dark:text-slate-400">{event.note}</p> : null}
                <p className="mt-0.5 text-xs text-slate-500">
                  {event.actor ?? 'System'} · {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-sm">
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                  <PhoneCall className="h-4 w-4 text-slate-400" />
                  {OUTCOME_LABEL[event.outcome] ?? event.outcome}
                </div>
                {event.note ? <p className="mt-0.5 text-slate-600 dark:text-slate-400">{event.note}</p> : null}
                {event.nextCallAt ? (
                  <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                    Follow-up scheduled: {new Date(event.nextCallAt).toLocaleString()}
                  </p>
                ) : null}
                {event.cancellationReason ? (
                  <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">Reason: {event.cancellationReason}</p>
                ) : null}
                <p className="mt-0.5 text-xs text-slate-500">
                  {event.actor ?? 'Unknown agent'} · {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
