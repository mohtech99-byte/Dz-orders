import { EmptyState } from '@/components/shared/empty-state';
import type { DashboardSeriesPoint } from '@/server/services/dashboard';

interface BarSeriesChartProps {
  title: string;
  description?: string;
  data: DashboardSeriesPoint[];
  formatValue?: (value: number) => string;
  barColorClassName?: string;
  emptyMessage?: string;
}

const CHART_HEIGHT = 160;
const CHART_WIDTH = 640;
const PADDING_X = 8;

export function BarSeriesChart({
  title,
  description,
  data,
  formatValue = (value) => value.toLocaleString(),
  barColorClassName = 'fill-primary',
  emptyMessage = 'No data for this period yet.'
}: BarSeriesChartProps) {
  if (data.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <EmptyState title="No orders yet" description={emptyMessage} />
      </div>
    );
  }

  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const barWidth = (CHART_WIDTH - PADDING_X * 2) / data.length;
  const innerBarWidth = Math.max(barWidth * 0.6, 2);

  const latest = data[data.length - 1];
  const peak = data.reduce((max, point) => (point.value > max.value ? point : max), data[0]);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>
            Latest: <span className="font-medium text-foreground">{formatValue(latest.value)}</span>
          </div>
          <div>
            Peak: <span className="font-medium text-foreground">{formatValue(peak.value)}</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-40 w-full" preserveAspectRatio="none" role="img" aria-label={title}>
        <line x1={0} y1={CHART_HEIGHT - 1} x2={CHART_WIDTH} y2={CHART_HEIGHT - 1} className="stroke-border" strokeWidth={1} />
        {data.map((point, index) => {
          const barHeight = Math.max((point.value / maxValue) * (CHART_HEIGHT - 24), point.value > 0 ? 2 : 0);
          const x = PADDING_X + index * barWidth + (barWidth - innerBarWidth) / 2;
          const y = CHART_HEIGHT - barHeight - 1;

          return (
            <rect key={point.date} x={x} y={y} width={innerBarWidth} height={barHeight} rx={2} className={barColorClassName} opacity={0.85}>
              <title>
                {point.date}: {formatValue(point.value)}
              </title>
            </rect>
          );
        })}
      </svg>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0].date}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
