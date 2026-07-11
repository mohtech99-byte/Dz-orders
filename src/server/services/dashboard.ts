import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { MembershipRole, OrderStatus, OrderSource, PaymentMethod, Prisma } from '@prisma/client';

export type DashboardRange = 'today' | 'week' | 'month' | 'custom';

export interface DashboardParams {
  range?: DashboardRange;
  dateFrom?: string;
  dateTo?: string;
  status?: OrderStatus | 'ALL';
  source?: OrderSource | 'ALL';
  paymentMethod?: PaymentMethod | 'ALL';
}

interface DateRangeWindow {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  label: string;
}

export interface DashboardSummaryCard {
  label: string;
  value: number;
  delta: number;
  trend: 'up' | 'down' | 'neutral';
  helperText: string;
}

export interface DashboardSummary {
  rangeLabel: string;
  cards: DashboardSummaryCard[];
}

export interface DashboardSeriesPoint {
  date: string;
  value: number;
}

export interface DashboardStatusBreakdownItem {
  status: string;
  count: number;
}

export interface DashboardTopProductItem {
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardTopCustomerItem {
  customerName: string;
  orderCount: number;
  totalSpent: number;
}

export interface DashboardRecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: Date;
}

export interface DashboardAlertItem {
  title: string;
  description: string;
  tone: 'info' | 'warning' | 'success';
}

export interface DashboardCodBreakdown {
  codOrders: number;
  prepaidOrders: number;
  codRevenue: number;
  prepaidRevenue: number;
  codPercentage: number;
}

export interface DashboardWilayaPressureItem {
  wilayaId: number;
  wilayaName: string;
  pendingOrders: number;
}

export interface DashboardPageData {
  viewerRole: MembershipRole;
  summary: DashboardSummary;
  ordersSeries: DashboardSeriesPoint[];
  revenueSeries: DashboardSeriesPoint[];
  statusBreakdown: DashboardStatusBreakdownItem[];
  topProducts: DashboardTopProductItem[];
  topCustomers: DashboardTopCustomerItem[];
  recentOrders: DashboardRecentOrderItem[];
  alerts: DashboardAlertItem[];
  codBreakdown: DashboardCodBreakdown | null;
  wilayaPressure: DashboardWilayaPressureItem[];
}

const PENDING_STATUSES: OrderStatus[] = ['NEW', 'CALLING', 'CONFIRMED', 'READY_TO_SHIP', 'PACKED'];
const IN_TRANSIT_STATUSES: OrderStatus[] = ['NEW', 'CALLING', 'CONFIRMED', 'READY_TO_SHIP', 'PACKED', 'SHIPPED'];
const AWAITING_CONFIRMATION_STATUSES: OrderStatus[] = ['NEW', 'CALLING'];

interface OrganizationContext {
  organizationId: string;
  role: MembershipRole;
}

async function getOrganizationContext(): Promise<OrganizationContext> {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE'
    },
    select: { organizationId: true, role: true },
    orderBy: { createdAt: 'asc' }
  });

  if (!membership?.organizationId) {
    throw new Error('Organization not found');
  }

  return { organizationId: membership.organizationId, role: membership.role };
}

async function getOrganizationId(): Promise<string> {
  const context = await getOrganizationContext();
  return context.organizationId;
}

function normalizeRange(range?: DashboardRange): DashboardRange {
  return range === 'today' || range === 'week' || range === 'month' || range === 'custom' ? range : 'month';
}

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function buildDateRange(params: DashboardParams): DateRangeWindow {
  const range = normalizeRange(params.range);
  const now = new Date();

  if (range === 'custom') {
    const from = parseDate(params.dateFrom);
    const to = parseDate(params.dateTo);

    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      const duration = end.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - duration - 24 * 60 * 60 * 1000);
      const previousEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);

      return {
        from: start,
        to: end,
        previousFrom: previousStart,
        previousTo: previousEnd,
        label: 'Custom range'
      };
    }
  }

  if (range === 'today') {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);

    const previousFrom = new Date(from);
    previousFrom.setDate(previousFrom.getDate() - 1);
    const previousTo = new Date(to);
    previousTo.setDate(previousTo.getDate() - 1);

    return { from, to, previousFrom, previousTo, label: 'Today' };
  }

  if (range === 'week') {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const previousStart = new Date(startOfWeek);
    previousStart.setDate(previousStart.getDate() - 7);
    const previousEnd = new Date(startOfWeek);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);

    return { from: startOfWeek, to: endOfWeek, previousFrom: previousStart, previousTo: previousEnd, label: 'This week' };
  }

  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  return { from, to, previousFrom, previousTo, label: 'This month' };
}

function buildTrend(current: number, previous: number): DashboardSummaryCard['trend'] {
  if (current > previous) {
    return 'up';
  }

  if (current < previous) {
    return 'down';
  }

  return 'neutral';
}

function buildCard(label: string, value: number, previous: number, helperText: string): DashboardSummaryCard {
  const delta = value - previous;
  return {
    label,
    value,
    delta: Math.abs(delta),
    trend: buildTrend(value, previous),
    helperText
  };
}

function buildOrderWhere(organizationId: string, range: DateRangeWindow, params: DashboardParams): Prisma.OrderWhereInput {
  return {
    organizationId,
    createdAt: {
      gte: range.from,
      lte: range.to
    },
    ...(params.status && params.status !== 'ALL' ? { status: params.status as OrderStatus } : {}),
    ...(params.source && params.source !== 'ALL' ? { source: params.source as OrderSource } : {}),
    ...(params.paymentMethod && params.paymentMethod !== 'ALL' ? { paymentMethod: params.paymentMethod as PaymentMethod } : {})
  };
}

function buildPreviousOrderWhere(organizationId: string, range: DateRangeWindow, params: DashboardParams): Prisma.OrderWhereInput {
  return {
    organizationId,
    createdAt: {
      gte: range.previousFrom,
      lte: range.previousTo
    },
    ...(params.status && params.status !== 'ALL' ? { status: params.status as OrderStatus } : {}),
    ...(params.source && params.source !== 'ALL' ? { source: params.source as OrderSource } : {}),
    ...(params.paymentMethod && params.paymentMethod !== 'ALL' ? { paymentMethod: params.paymentMethod as PaymentMethod } : {})
  };
}

async function getOrderCounts(organizationId: string, range: DateRangeWindow, params: DashboardParams) {
  const where = buildOrderWhere(organizationId, range, params);
  const previousWhere = buildPreviousOrderWhere(organizationId, range, params);

  const [current, previous] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({ where: previousWhere })
  ]);

  return { current, previous };
}

async function getOrderRevenue(organizationId: string, range: DateRangeWindow, params: DashboardParams) {
  const where = buildOrderWhere(organizationId, range, params);
  const previousWhere = buildPreviousOrderWhere(organizationId, range, params);

  const [current, previous] = await Promise.all([
    prisma.order.aggregate({ where, _sum: { total: true } }),
    prisma.order.aggregate({ where: previousWhere, _sum: { total: true } })
  ]);

  return {
    current: current._sum.total ?? 0,
    previous: previous._sum.total ?? 0
  };
}

// ---------------------------------------------------------------------------
// Internal implementations. These accept an already-resolved organizationId so
// getDashboardPageData can resolve the membership/organization context once
// and fan the reads out, instead of re-querying membership for every widget.
// ---------------------------------------------------------------------------

async function getDashboardSummaryImpl(organizationId: string, params: DashboardParams): Promise<DashboardSummary> {
  const range = buildDateRange(params);

  const [orders, revenue, pending, confirmed, delivered, returned, customers, products] = await Promise.all([
    getOrderCounts(organizationId, range, params),
    getOrderRevenue(organizationId, range, params),
    prisma.order.count({ where: { organizationId, status: { in: PENDING_STATUSES }, createdAt: { gte: range.from, lte: range.to } } }),
    prisma.order.count({ where: { organizationId, status: 'READY_TO_SHIP', createdAt: { gte: range.from, lte: range.to } } }),
    prisma.order.count({ where: { organizationId, status: 'DELIVERED', createdAt: { gte: range.from, lte: range.to } } }),
    prisma.order.count({ where: { organizationId, status: 'RETURNED', createdAt: { gte: range.from, lte: range.to } } }),
    prisma.customer.count({ where: { organizationId, deletedAt: null } }),
    prisma.product.count({ where: { organizationId, status: 'ACTIVE' } })
  ]);

  return {
    rangeLabel: range.label,
    cards: [
      buildCard('Orders', orders.current, orders.previous, `vs ${range.label.toLowerCase()}`),
      buildCard('Revenue', revenue.current, revenue.previous, 'vs previous period'),
      buildCard('Pending', pending, 0, 'Awaiting fulfillment'),
      buildCard('Ready to ship', confirmed, 0, 'Confirmed and queued for packing'),
      buildCard('Delivered', delivered, 0, 'Completed orders'),
      buildCard('Returned', returned, 0, 'Needs follow-up'),
      buildCard('Customers', customers, 0, 'Active profiles'),
      buildCard('Products', products, 0, 'Active catalog')
    ]
  };
}

async function getDashboardOrdersSeriesImpl(organizationId: string, params: DashboardParams): Promise<DashboardSeriesPoint[]> {
  const range = buildDateRange(params);

  const rows = await prisma.$queryRaw<Array<{ date: string; orderCount: number }>>`
    SELECT DATE("createdAt")::text AS "date", COUNT(*)::int AS "orderCount"
    FROM "Order"
    WHERE "organizationId" = ${organizationId}
      AND "createdAt" >= ${range.from}
      AND "createdAt" <= ${range.to}
    GROUP BY DATE("createdAt")
    ORDER BY DATE("createdAt")
  `;

  return rows.map((row) => ({ date: row.date, value: row.orderCount }));
}

async function getDashboardRevenueSeriesImpl(organizationId: string, params: DashboardParams): Promise<DashboardSeriesPoint[]> {
  const range = buildDateRange(params);

  const rows = await prisma.$queryRaw<Array<{ date: string; revenue: number }>>`
    SELECT DATE("createdAt")::text AS "date", SUM("total")::int AS "revenue"
    FROM "Order"
    WHERE "organizationId" = ${organizationId}
      AND "createdAt" >= ${range.from}
      AND "createdAt" <= ${range.to}
    GROUP BY DATE("createdAt")
    ORDER BY DATE("createdAt")
  `;

  return rows.map((row) => ({ date: row.date, value: row.revenue }));
}

async function getDashboardStatusBreakdownImpl(organizationId: string, params: DashboardParams): Promise<DashboardStatusBreakdownItem[]> {
  const range = buildDateRange(params);
  const where = buildOrderWhere(organizationId, range, params);

  const rows = await prisma.order.groupBy({
    by: ['status'],
    where,
    _count: { id: true }
  });

  return rows.map((row) => ({ status: row.status, count: row._count.id }));
}

async function getDashboardTopProductsImpl(organizationId: string, params: DashboardParams): Promise<DashboardTopProductItem[]> {
  const range = buildDateRange(params);

  const rows = await prisma.$queryRaw<Array<{ productName: string; quantitySold: number; revenue: number }>>`
    SELECT oi."productNameSnapshot" AS "productName",
           SUM(oi."quantity")::int AS "quantitySold",
           SUM(oi."lineTotal")::int AS "revenue"
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON oi."orderId" = o."id"
    WHERE o."organizationId" = ${organizationId}
      AND o."createdAt" >= ${range.from}
      AND o."createdAt" <= ${range.to}
    GROUP BY oi."productNameSnapshot"
    ORDER BY "revenue" DESC, "quantitySold" DESC
    LIMIT 5
  `;

  return rows.map((row) => ({
    productName: row.productName,
    quantitySold: row.quantitySold,
    revenue: row.revenue
  }));
}

async function getDashboardTopCustomersImpl(organizationId: string, params: DashboardParams): Promise<DashboardTopCustomerItem[]> {
  const range = buildDateRange(params);

  const rows = await prisma.$queryRaw<Array<{ customerName: string; orderCount: number; totalSpent: number }>>`
    SELECT COALESCE(c."fullName", o."phoneSnapshot") AS "customerName",
           COUNT(DISTINCT o."id")::int AS "orderCount",
           SUM(o."total")::int AS "totalSpent"
    FROM "Order" o
    LEFT JOIN "Customer" c ON o."customerId" = c."id"
    WHERE o."organizationId" = ${organizationId}
      AND o."createdAt" >= ${range.from}
      AND o."createdAt" <= ${range.to}
    GROUP BY COALESCE(c."fullName", o."phoneSnapshot")
    ORDER BY "totalSpent" DESC, "orderCount" DESC
    LIMIT 5
  `;

  return rows.map((row) => ({
    customerName: row.customerName,
    orderCount: row.orderCount,
    totalSpent: row.totalSpent
  }));
}

async function getDashboardRecentOrdersImpl(organizationId: string, params: DashboardParams): Promise<DashboardRecentOrderItem[]> {
  const range = buildDateRange(params);

  const orders = await prisma.order.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: range.from,
        lte: range.to
      }
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      customer: {
        select: { fullName: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer?.fullName ?? 'Walk-in',
    status: order.status,
    total: order.total,
    createdAt: order.createdAt
  }));
}

async function getDashboardOperationalAlertsImpl(organizationId: string, params: DashboardParams): Promise<DashboardAlertItem[]> {
  const range = buildDateRange(params);

  const [awaitingConfirmation, pendingCount, returnedCount, deliveredCount, blacklistedCount, followUpsDue, repeatOffenderRows] =
    await Promise.all([
      prisma.order.count({ where: { organizationId, status: { in: AWAITING_CONFIRMATION_STATUSES }, createdAt: { gte: range.from, lte: range.to } } }),
      prisma.order.count({ where: { organizationId, status: { in: PENDING_STATUSES }, createdAt: { gte: range.from, lte: range.to } } }),
      prisma.order.count({ where: { organizationId, status: 'RETURNED', createdAt: { gte: range.from, lte: range.to } } }),
      prisma.order.count({ where: { organizationId, status: 'DELIVERED', createdAt: { gte: range.from, lte: range.to } } }),
      prisma.customer.count({ where: { organizationId, deletedAt: null, isBlacklisted: true } }),
      prisma.order.count({
        where: { organizationId, status: { in: AWAITING_CONFIRMATION_STATUSES }, nextCallAt: { lte: new Date() } }
      }),
      prisma.$queryRaw<Array<{ id: string }>>`
        SELECT c."id" AS "id"
        FROM "Customer" c
        INNER JOIN "Order" o ON o."customerId" = c."id"
        WHERE c."organizationId" = ${organizationId}
          AND c."deletedAt" IS NULL
          AND c."isBlacklisted" = false
        GROUP BY c."id"
        HAVING COUNT(*) FILTER (WHERE o."status" IN ('CANCELLED', 'RETURNED')) >= 2
      `
    ]);

  const repeatOffenderCount = repeatOffenderRows.length;

  const alerts: DashboardAlertItem[] = [];

  if (repeatOffenderCount > 0) {
    alerts.push({
      title: `${repeatOffenderCount} customers with risky order history`,
      description: 'Repeated cancellations or returns, but not yet blacklisted — worth a review.',
      tone: 'warning'
    });
  }

  if (followUpsDue > 0) {
    alerts.push({
      title: `${followUpsDue} follow-up calls due`,
      description: 'These customers asked for a callback or need a retry — reach out today.',
      tone: 'warning'
    });
  }

  if (awaitingConfirmation > 0) {
    alerts.push({
      title: `${awaitingConfirmation} orders awaiting confirmation`,
      description: 'Call these customers before packing to reduce failed COD deliveries.',
      tone: 'warning'
    });
  }

  if (pendingCount > 0) {
    alerts.push({
      title: `${pendingCount} pending orders`,
      description: 'Review the fulfillment queue before the next dispatch window.',
      tone: 'warning'
    });
  }

  if (returnedCount > 0) {
    alerts.push({
      title: `${returnedCount} returns to follow up`,
      description: 'Check customer feedback and replacement logistics.',
      tone: 'info'
    });
  }

  if (blacklistedCount > 0) {
    alerts.push({
      title: `${blacklistedCount} blacklisted customers on file`,
      description: 'Double-check new orders from flagged phone numbers before confirming.',
      tone: 'warning'
    });
  }

  if (deliveredCount > 0) {
    alerts.push({
      title: `${deliveredCount} completed deliveries`,
      description: 'The team is staying productive and closing orders.',
      tone: 'success'
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      title: 'No operational alerts',
      description: 'This period looks calm. Keep monitoring for new orders.',
      tone: 'info'
    });
  }

  return alerts;
}

async function getDashboardCodBreakdownImpl(organizationId: string, params: DashboardParams): Promise<DashboardCodBreakdown> {
  const range = buildDateRange(params);
  // Payment method is the dimension being measured here, so this widget
  // ignores an active paymentMethod filter and always shows the full mix.
  const where = buildOrderWhere(organizationId, range, { ...params, paymentMethod: 'ALL' });

  const rows = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where,
    _count: { id: true },
    _sum: { total: true }
  });

  const cod = rows.find((row) => row.paymentMethod === 'COD');
  const prepaid = rows.find((row) => row.paymentMethod === 'PREPAID');

  const codOrders = cod?._count.id ?? 0;
  const prepaidOrders = prepaid?._count.id ?? 0;
  const totalOrders = codOrders + prepaidOrders;

  return {
    codOrders,
    prepaidOrders,
    codRevenue: cod?._sum.total ?? 0,
    prepaidRevenue: prepaid?._sum.total ?? 0,
    codPercentage: totalOrders > 0 ? Math.round((codOrders / totalOrders) * 100) : 0
  };
}

async function getDashboardWilayaPressureImpl(organizationId: string, params: DashboardParams): Promise<DashboardWilayaPressureItem[]> {
  const range = buildDateRange(params);

  const rows = await prisma.$queryRaw<Array<{ wilayaId: number; wilayaName: string; pendingOrders: number }>>`
    SELECT o."wilayaId" AS "wilayaId",
           w."nameFr" AS "wilayaName",
           COUNT(*)::int AS "pendingOrders"
    FROM "Order" o
    INNER JOIN "Wilaya" w ON o."wilayaId" = w."id"
    WHERE o."organizationId" = ${organizationId}
      AND o."createdAt" >= ${range.from}
      AND o."createdAt" <= ${range.to}
      AND o."status" = ANY (${IN_TRANSIT_STATUSES}::"OrderStatus"[])
    GROUP BY o."wilayaId", w."nameFr"
    ORDER BY "pendingOrders" DESC
    LIMIT 5
  `;

  return rows.map((row) => ({
    wilayaId: row.wilayaId,
    wilayaName: row.wilayaName,
    pendingOrders: row.pendingOrders
  }));
}

// ---------------------------------------------------------------------------
// Public service API — matches the function names required by
// PHASE_5_ARCHITECTURE.md section 6.1. Each resolves its own organization
// context, so these remain safe to call individually (e.g. from a future
// API route), while getDashboardPageData below resolves the context once.
// ---------------------------------------------------------------------------

export async function getDashboardSummary(params: DashboardParams = {}): Promise<DashboardSummary> {
  const organizationId = await getOrganizationId();
  return getDashboardSummaryImpl(organizationId, params);
}

export async function getDashboardOrdersSeries(params: DashboardParams = {}): Promise<DashboardSeriesPoint[]> {
  const organizationId = await getOrganizationId();
  return getDashboardOrdersSeriesImpl(organizationId, params);
}

export async function getDashboardRevenueSeries(params: DashboardParams = {}): Promise<DashboardSeriesPoint[]> {
  const organizationId = await getOrganizationId();
  return getDashboardRevenueSeriesImpl(organizationId, params);
}

export async function getDashboardStatusBreakdown(params: DashboardParams = {}): Promise<DashboardStatusBreakdownItem[]> {
  const organizationId = await getOrganizationId();
  return getDashboardStatusBreakdownImpl(organizationId, params);
}

export async function getDashboardTopProducts(params: DashboardParams = {}): Promise<DashboardTopProductItem[]> {
  const organizationId = await getOrganizationId();
  return getDashboardTopProductsImpl(organizationId, params);
}

export async function getDashboardTopCustomers(params: DashboardParams = {}): Promise<DashboardTopCustomerItem[]> {
  const organizationId = await getOrganizationId();
  return getDashboardTopCustomersImpl(organizationId, params);
}

export async function getDashboardRecentOrders(params: DashboardParams = {}): Promise<DashboardRecentOrderItem[]> {
  const organizationId = await getOrganizationId();
  return getDashboardRecentOrdersImpl(organizationId, params);
}

export async function getDashboardOperationalAlerts(params: DashboardParams = {}): Promise<DashboardAlertItem[]> {
  const organizationId = await getOrganizationId();
  return getDashboardOperationalAlertsImpl(organizationId, params);
}

export async function getDashboardCodBreakdown(params: DashboardParams = {}): Promise<DashboardCodBreakdown> {
  const organizationId = await getOrganizationId();
  return getDashboardCodBreakdownImpl(organizationId, params);
}

export async function getDashboardWilayaPressure(params: DashboardParams = {}): Promise<DashboardWilayaPressureItem[]> {
  const organizationId = await getOrganizationId();
  return getDashboardWilayaPressureImpl(organizationId, params);
}

/**
 * Resolves the full dashboard page in one pass: the organization/membership
 * context is looked up exactly once, then every widget is fetched in
 * parallel. DELIVERY_AGENT accounts get a fulfillment-focused view — revenue,
 * COD-mix, and customer-value data are withheld per the Phase 5 permission
 * model (section 9.2 of PHASE_5_ARCHITECTURE.md).
 */
export async function getDashboardPageData(params: DashboardParams = {}): Promise<DashboardPageData> {
  const { organizationId, role } = await getOrganizationContext();
  const isFulfillmentOnly = role === 'DELIVERY_AGENT';

  const [summary, ordersSeries, revenueSeries, statusBreakdown, topProducts, topCustomers, recentOrders, alerts, codBreakdown, wilayaPressure] =
    await Promise.all([
      getDashboardSummaryImpl(organizationId, params),
      getDashboardOrdersSeriesImpl(organizationId, params),
      isFulfillmentOnly ? Promise.resolve([]) : getDashboardRevenueSeriesImpl(organizationId, params),
      getDashboardStatusBreakdownImpl(organizationId, params),
      isFulfillmentOnly ? Promise.resolve([]) : getDashboardTopProductsImpl(organizationId, params),
      isFulfillmentOnly ? Promise.resolve([]) : getDashboardTopCustomersImpl(organizationId, params),
      getDashboardRecentOrdersImpl(organizationId, params),
      getDashboardOperationalAlertsImpl(organizationId, params),
      isFulfillmentOnly ? Promise.resolve(null) : getDashboardCodBreakdownImpl(organizationId, params),
      getDashboardWilayaPressureImpl(organizationId, params)
    ]);

  return {
    viewerRole: role,
    summary,
    ordersSeries,
    revenueSeries,
    statusBreakdown,
    topProducts,
    topCustomers,
    recentOrders,
    alerts,
    codBreakdown,
    wilayaPressure
  };
}
