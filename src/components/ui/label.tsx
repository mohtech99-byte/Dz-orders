'use client';

import * as React from 'react';
import clsx from 'clsx';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return <label className={clsx('text-sm font-medium text-slate-700 dark:text-slate-200', className)} {...props} />;
}
