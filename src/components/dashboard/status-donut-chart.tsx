import { EmptyState } from '@/components/shared/empty-state';
import type { DashboardStatusBreakdownItem } from '@/server/services/dashboard';

interface StatusDonutChartProps {
  data: DashboardStatusBreakdownItem[];
}

const STATUS_COLOR: Record<string, { stroke: string; dot: string; label: string }> = {
  NEW: { stroke: 'stroke-slate-400', dot: 'bg-slate-400', label: 'New' },
  CALLING: { stroke: 'stroke-purple-500', dot: 'bg-purple-500', label: 'Calling' },
  CONFIRMED: { stroke: 'stroke-blue-500', dot: 'bg-blue-500', label: 'Confirmed' },
  READY_TO_SHIP: { stroke: 'stroke-teal-500', dot: 'bg-teal-500', label: 'Ready to ship' },
  PACKED: { stroke: 'stroke-indigo-500', dot: 'bg-indigo-500', label: 'Packed' },
  SHIPPED: { stroke: 'stroke-amber-500', dot: 'bg-amber-500', label: 'Shipped' },
  DELIVERED: { stroke: 'stroke-emerald-500', dot: 'bg-emerald-500', label: 'Delivered' },
  CANCELLED: { stroke: 'stroke-slate-600', dot: 'bg-slate-600', label: 'Cancelled' },
  RETURNED: { stroke: 'stroke-rose-500', dot: 'bg-rose-500', label: 'Returned' }
};

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDonutChart({ data }: StatusDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Orders by status</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Current pipeline health for the selected period.</p>
      </div>

      {total === 0 ? (
        <EmptyState title="No orders yet" description="Order statuses will appear here once orders start coming in." />
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90" role="img" aria-label="Orders by status">
            <circle cx={70} cy={70} r={RADIUS} fill="none" strokeWidth={16} className="stroke-slate-100 dark:stroke-slate-800" />
            {(() => {
              let offset = 0;
              return data
                .filter((item) => item.count > 0)
                .map((item) => {
                  const fraction = item.count / total;
                  const segmentLength = fraction * CIRCUMFERENCE;
                  const dashArray = `${segmentLength} ${CIRCUMFERENCE - segmentLength}`;
                  const dashOffset = -offset;
                  offset += segmentLength;
                  const colors = STATUS_COLOR[item.status] ?? STATUS_COLOR.NEW;

                  return (
                    <circle
                      key={item.status}
                      cx={70}
                      cy={70}
                      r={RADIUS}
                      fill="none"
                      strokeWidth={16}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className={colors.stroke}
                    >
                      <title>
                        {item.status}: {item.count}
                      </title>
                    </circle>
                  );
                });
            })()}
          </svg>

          <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            {data.map((item) => {
              const colors = STATUS_COLOR[item.status] ?? STATUS_COLOR.NEW;
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <li key={item.status} className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                  <span className="text-slate-700 dark:text-slate-300">{colors.label}</span>
                  <span className="ml-auto font-medium text-slate-900 dark:text-slate-100">
                    {item.count} ({percentage}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
