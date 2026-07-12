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
      <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground shadow-card">
        No activity recorded for this order yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h3>

      <ol className="mt-4 space-y-4 border-l border-border pl-4">
        {events.map((event) => (
          <li key={`${event.type}-${event.id}`} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground" />

            {event.type === 'STATUS_CHANGE' ? (
              <div className="text-sm">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ArrowRightCircle className="h-4 w-4 text-muted-foreground" />
                  {event.fromStatus} → {event.toStatus}
                </div>
                {event.note ? <p className="mt-0.5 text-muted-foreground">{event.note}</p> : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.actor ?? 'System'} · {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-sm">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <PhoneCall className="h-4 w-4 text-muted-foreground" />
                  {OUTCOME_LABEL[event.outcome] ?? event.outcome}
                </div>
                {event.note ? <p className="mt-0.5 text-muted-foreground">{event.note}</p> : null}
                {event.nextCallAt ? (
                  <p className="mt-0.5 text-xs text-info">
                    Follow-up scheduled: {new Date(event.nextCallAt).toLocaleString()}
                  </p>
                ) : null}
                {event.cancellationReason ? (
                  <p className="mt-0.5 text-xs text-danger">Reason: {event.cancellationReason}</p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
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
