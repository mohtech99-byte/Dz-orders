'use client';

import * as React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1 pb-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      {description ? <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
    </div>
  );
}
