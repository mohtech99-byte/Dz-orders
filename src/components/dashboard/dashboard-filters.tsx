import type { DashboardRange } from '@/server/services/dashboard';
import { Button } from '@/components/ui/button';

interface DashboardFiltersProps {
  range: DashboardRange;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  source?: string;
  paymentMethod?: string;
}

export function DashboardFilters({ range, dateFrom, dateTo, status, source, paymentMethod }: DashboardFiltersProps) {
  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card md:flex-row md:flex-wrap md:items-end"
      method="get"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Range
        <select
          name="range"
          defaultValue={range}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="custom">Custom range</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        From
        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom ?? ''}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        To
        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo ?? ''}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Status
        <select
          name="status"
          defaultValue={status ?? 'ALL'}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="CALLING">Calling</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="READY_TO_SHIP">Ready to ship</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURNED">Returned</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Source
        <select
          name="source"
          defaultValue={source ?? 'ALL'}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="ALL">All sources</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="TIKTOK">TikTok</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="MANUAL">Manual</option>
          <option value="PUBLIC_FORM">Public form</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Payment
        <select
          name="paymentMethod"
          defaultValue={paymentMethod ?? 'ALL'}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="ALL">All payments</option>
          <option value="COD">Cash on delivery</option>
          <option value="PREPAID">Prepaid</option>
        </select>
      </label>

      <Button type="submit">Apply filters</Button>
    </form>
  );
}
