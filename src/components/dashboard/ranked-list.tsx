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
  barColorClassName = 'bg-primary'
}: RankedListProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {index + 1}. {item.primaryLabel}
                </span>
                <span className="text-muted-foreground">{item.valueLabel}</span>
              </div>
              {item.secondaryLabel ? <p className="text-xs text-muted-foreground">{item.secondaryLabel}</p> : null}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
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
