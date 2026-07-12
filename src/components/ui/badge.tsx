import * as React from 'react';
import clsx from 'clsx';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-hover text-muted-foreground border border-border',
  success: 'bg-success-bg text-success border border-success/20',
  warning: 'bg-warning-bg text-warning border border-warning/20',
  danger: 'bg-danger-bg text-danger border border-danger/20',
  info: 'bg-info-bg text-info border border-info/20',
  primary: 'bg-primary/10 text-primary border border-primary/20'
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  primary: 'bg-primary'
};

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    >
      {dot ? <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASSES[tone])} /> : null}
      {children}
    </span>
  );
}

/** Maps an Order status to a badge tone + human label — single source of truth
 *  so every table, card, and detail page renders status consistently. */
export const ORDER_STATUS_BADGE: Record<string, { tone: BadgeTone; label: string }> = {
  NEW: { tone: 'neutral', label: 'New' },
  CALLING: { tone: 'primary', label: 'Calling' },
  CONFIRMED: { tone: 'info', label: 'Confirmed' },
  READY_TO_SHIP: { tone: 'info', label: 'Ready to ship' },
  PACKED: { tone: 'warning', label: 'Packed' },
  SHIPPED: { tone: 'warning', label: 'Shipped' },
  DELIVERED: { tone: 'success', label: 'Delivered' },
  CANCELLED: { tone: 'danger', label: 'Cancelled' },
  RETURNED: { tone: 'danger', label: 'Returned' }
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS_BADGE[status] ?? { tone: 'neutral' as const, label: status };
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
