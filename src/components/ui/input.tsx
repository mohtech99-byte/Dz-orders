import * as React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error = false, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground/70',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger focus-visible:ring-danger' : 'border-border focus-visible:ring-primary',
        className
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}
