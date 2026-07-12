import * as React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export function Card({ className, interactive = false, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface shadow-card',
        PADDING_CLASSES[padding],
        interactive && 'transition-shadow duration-150 hover:shadow-elevated',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('mb-4 flex items-center justify-between gap-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('text-sm font-semibold uppercase tracking-wide text-muted-foreground', className)} {...props} />;
}
