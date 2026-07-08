import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardSummaryCard } from '@/server/services/dashboard';

interface KpiGridProps {
  cards: DashboardSummaryCard[];
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus
} as const;

const TREND_COLOR = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-slate-500 dark:text-slate-400'
} as const;

function formatValue(card: DashboardSummaryCard) {
  if (card.label === 'Revenue') {
    return `${card.value.toLocaleString()} DZD`;
  }

  return card.value.toLocaleString();
}

function formatDelta(card: DashboardSummaryCard) {
  if (card.delta === 0) {
    return card.helperText;
  }

  const formattedDelta = card.label === 'Revenue' ? `${card.delta.toLocaleString()} DZD` : card.delta.toLocaleString();
  return `${card.trend === 'up' ? '+' : card.trend === 'down' ? '-' : ''}${formattedDelta} ${card.helperText}`;
}

export function KpiGrid({ cards }: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = TREND_ICON[card.trend];

        return (
          <Card key={card.label} className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatValue(card)}</p>
            <p className={`flex items-center gap-1 text-xs font-medium ${TREND_COLOR[card.trend]}`}>
              <Icon className="h-3.5 w-3.5" />
              {formatDelta(card)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
