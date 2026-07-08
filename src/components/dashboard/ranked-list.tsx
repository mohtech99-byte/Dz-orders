import { EmptyState } from '@/components/shared/empty-state';

export interface RankedListItem {
  key: string;
  primaryLabel: string;
  secondaryLabel?: string;
  value: number;
  valueLabel: string;
}

interface RankedListProps {
  title: string;
  description?: string;
  items: RankedListItem[];
  emptyTitle: string;
  emptyDescription: string;
  barColorClassName?: string;
}

export function RankedList({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  barColorClassName = 'bg-slate-900 dark:bg-slate-100'
}: RankedListProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {description ? <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {index + 1}. {item.primaryLabel}
                </span>
                <span className="text-slate-600 dark:text-slate-400">{item.valueLabel}</span>
              </div>
              {item.secondaryLabel ? <p className="text-xs text-slate-500 dark:text-slate-400">{item.secondaryLabel}</p> : null}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${barColorClassName}`}
                  style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
