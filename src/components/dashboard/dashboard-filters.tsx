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
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end dark:border-slate-800 dark:bg-slate-950"
      method="get"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        Range
        <select
          name="range"
          defaultValue={range}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="custom">Custom range</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        From
        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom ?? ''}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        To
        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo ?? ''}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        Status
        <select
          name="status"
          defaultValue={status ?? 'ALL'}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURNED">Returned</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        Source
        <select
          name="source"
          defaultValue={source ?? 'ALL'}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        Payment
        <select
          name="paymentMethod"
          defaultValue={paymentMethod ?? 'ALL'}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
