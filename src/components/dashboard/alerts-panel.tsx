import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { DashboardAlertItem } from '@/server/services/dashboard';

interface AlertsPanelProps {
  alerts: DashboardAlertItem[];
}

const TONE_STYLES: Record<DashboardAlertItem['tone'], { icon: typeof Info; className: string }> = {
  warning: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200' },
  info: { icon: Info, className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200' },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
  }
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Operational alerts</h3>
        <p className="text-sm text-muted-foreground">Quick signals worth acting on today.</p>
      </div>

      <ul className="space-y-3">
        {alerts.map((alert) => {
          const { icon: Icon, className } = TONE_STYLES[alert.tone];

          return (
            <li key={alert.title} className={`flex gap-3 rounded-xl border p-4 text-sm ${className}`}>
              <Icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="mt-0.5 opacity-90">{alert.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
