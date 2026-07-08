import { PageHeader } from '@/components/shared/page-header';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { BarSeriesChart } from '@/components/dashboard/bar-series-chart';
import { StatusDonutChart } from '@/components/dashboard/status-donut-chart';
import { RankedList } from '@/components/dashboard/ranked-list';
import { CodBreakdownCard } from '@/components/dashboard/cod-breakdown-card';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { RecentOrdersList } from '@/components/dashboard/recent-orders-list';
import { getDashboardPageData, type DashboardParams, type DashboardRange } from '@/server/services/dashboard';
import type { OrderSource, OrderStatus, PaymentMethod } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface DashboardHomePageProps {
  searchParams: {
    range?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    source?: string;
    paymentMethod?: string;
  };
}

function normalizeRange(value?: string): DashboardRange {
  return value === 'today' || value === 'week' || value === 'month' || value === 'custom' ? value : 'month';
}

export default async function DashboardHomePage({ searchParams }: DashboardHomePageProps) {
  const range = normalizeRange(searchParams.range);

  const params: DashboardParams = {
    range,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    status: (searchParams.status as OrderStatus | undefined) || 'ALL',
    source: (searchParams.source as OrderSource | undefined) || 'ALL',
    paymentMethod: (searchParams.paymentMethod as PaymentMethod | undefined) || 'ALL'
  };

  const data = await getDashboardPageData(params);
  const isFulfillmentOnly = data.viewerRole === 'DELIVERY_AGENT';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          isFulfillmentOnly
            ? 'Fulfillment overview — orders, status, and delivery pressure for the selected period.'
            : `Operational overview for ${data.summary.rangeLabel.toLowerCase()}.`
        }
      />

      <DashboardFilters
        range={range}
        dateFrom={searchParams.dateFrom}
        dateTo={searchParams.dateTo}
        status={searchParams.status}
        source={searchParams.source}
        paymentMethod={searchParams.paymentMethod}
      />

      <KpiGrid cards={data.summary.cards} />

      <div className="grid gap-6 xl:grid-cols-2">
        <BarSeriesChart
          title="Orders per day"
          description="Daily order volume for the selected range."
          data={data.ordersSeries}
          emptyMessage="Orders will appear here once your first order comes in."
        />
        {!isFulfillmentOnly ? (
          <BarSeriesChart
            title="Revenue per day"
            description="Daily revenue for the selected range."
            data={data.revenueSeries}
            formatValue={(value) => `${value.toLocaleString()} DZD`}
            barColorClassName="fill-emerald-600 dark:fill-emerald-400"
            emptyMessage="Revenue will appear here once your first order is placed."
          />
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusDonutChart data={data.statusBreakdown} />
        {!isFulfillmentOnly ? <CodBreakdownCard data={data.codBreakdown} /> : null}
      </div>

      {!isFulfillmentOnly ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <RankedList
            title="Top products"
            description="Best sellers by revenue for the selected period."
            emptyTitle="No sales yet"
            emptyDescription="Top products will appear once orders include products."
            items={data.topProducts.map((product) => ({
              key: product.productName,
              primaryLabel: product.productName,
              secondaryLabel: `${product.quantitySold.toLocaleString()} units sold`,
              value: product.revenue,
              valueLabel: `${product.revenue.toLocaleString()} DZD`
            }))}
          />
          <RankedList
            title="Top customers"
            description="Most valuable customers for the selected period."
            emptyTitle="No customers yet"
            emptyDescription="Top customers will appear once orders start coming in."
            barColorClassName="bg-blue-600 dark:bg-blue-400"
            items={data.topCustomers.map((customer) => ({
              key: customer.customerName,
              primaryLabel: customer.customerName,
              secondaryLabel: `${customer.orderCount.toLocaleString()} orders`,
              value: customer.totalSpent,
              valueLabel: `${customer.totalSpent.toLocaleString()} DZD`
            }))}
          />
        </div>
      ) : null}

      <RankedList
        title="Delivery pressure by wilaya"
        description="Where orders are currently piling up in transit or awaiting fulfillment."
        emptyTitle="No delivery pressure"
        emptyDescription="Wilayas with pending or in-transit orders will appear here."
        barColorClassName="bg-amber-600 dark:bg-amber-400"
        items={data.wilayaPressure.map((item) => ({
          key: String(item.wilayaId),
          primaryLabel: item.wilayaName,
          value: item.pendingOrders,
          valueLabel: `${item.pendingOrders.toLocaleString()} orders`
        }))}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentOrdersList orders={data.recentOrders} />
        <AlertsPanel alerts={data.alerts} />
      </div>
    </div>
  );
}
