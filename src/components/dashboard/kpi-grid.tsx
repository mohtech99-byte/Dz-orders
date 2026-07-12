import { TrendingUp, TrendingDown, Minus, ShoppingCart, Wallet, Clock, PackageCheck, Truck, Undo2, Users, Boxes } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  up: 'text-success',
  down: 'text-danger',
  neutral: 'text-muted-foreground'
} as const;

const METRIC_ICON: Record<string, LucideIcon> = {
  Orders: ShoppingCart,
  Revenue: Wallet,
  Pending: Clock,
  'Ready to ship': PackageCheck,
  Delivered: Truck,
  Returned: Undo2,
  Customers: Users,
  Products: Boxes
};

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
        const TrendIcon = TREND_ICON[card.trend];
        const MetricIcon = METRIC_ICON[card.label] ?? ShoppingCart;

        return (
          <Card key={card.label} interactive className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MetricIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">{formatValue(card)}</p>
            <p className={`flex items-center gap-1 text-xs font-medium ${TREND_COLOR[card.trend]}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {formatDelta(card)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
