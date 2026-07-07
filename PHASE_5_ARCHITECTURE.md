# Phase 5 Architecture — Dashboard Analytics & Operations

Status: proposal only. No implementation work should begin until this document is reviewed and approved.

## 1. Overview

Phase 5 focuses on the dashboard experience for merchants operating a multi-tenant store. The goal is to provide a fast, actionable operational overview for daily fulfillment decisions, sales performance, and customer/product health.

This architecture is designed around the current codebase structure:
- Next.js App Router
- Server components for page rendering
- Prisma + PostgreSQL
- Tenant-scoped services using organizationId
- Existing server-action/service pattern for mutations
- shadcn/ui-style components already used in the project

The dashboard should be implemented as a read-focused analytics layer that sits on top of the current orders, customers, products, and membership models.

---

## 2. Dashboard architecture

### 2.1 Route and page structure

Primary route:
- / (dashboard home page inside the dashboard route group)

Suggested supporting routes:
- /?range=today
- /?range=week
- /?range=month
- /?range=custom

### 2.2 Architectural layers

1. Route layer
   - Server-rendered page under the existing dashboard route group
   - Accepts query params such as range, dateFrom, dateTo, status, source

2. Service layer
   - Centralized, tenant-aware business logic in src/server/services
   - Each dashboard query should resolve organization context from the authenticated user membership
   - All reads should be scoped by organizationId and active membership only

3. Data layer
   - Prisma queries against Order, Customer, Product, Membership, and related models
   - Aggregations should be done in SQL where possible to reduce application-side processing

4. Presentation layer
   - Reusable dashboard cards, chart wrappers, filters, and empty/loading states
   - Built with shadcn/ui primitives and lightweight chart components

### 2.3 Rendering strategy

Recommended approach:
- Use server components for initial dashboard load
- Keep the page mostly server-rendered to minimize client-side data fetching and improve performance
- Use small client-side components only for interactive filters, date pickers, and chart tooltips

### 2.4 Dashboard sections

The dashboard should contain the following major blocks:
- KPI cards row
- Primary chart row
- Secondary chart row
- Top products and top customers section
- Recent orders/activity section
- Quick actions and operational alerts

---

## 3. KPI card architecture

The dashboard should expose the following KPI cards:

1. Today's Orders
   - Count of orders created today for the active organization
   - Includes all statuses unless explicitly filtered

2. Revenue
   - Sum of order totals for the active date range
   - Should be based on finalized totals, not draft values

3. Pending Orders
   - Orders in NEW or CONFIRMED or PACKED states depending on business policy
   - Recommended: NEW + CONFIRMED + PACKED

4. Confirmed Orders
   - Orders with status CONFIRMED

5. Delivered Orders
   - Orders with status DELIVERED

6. Returned Orders
   - Orders with status RETURNED

7. Customers
   - Total active customers in the organization (excluding soft-deleted records)

8. Products
   - Total active products in the organization

### KPI card data contract

Each KPI card should return:
- label
- value
- delta vs previous period
- trend direction
- optional helper text such as “vs yesterday” or “vs last week”

### KPI source strategy

Implementation should use a single aggregated summary service that can resolve all cards in one query or a small set of batched queries.

---

## 4. Charts architecture

### 4.1 Orders per day

Purpose:
- Show daily order volume trends over a selected range

Recommended visualization:
- Line chart or bar chart

Data shape:
- date
- orderCount

Use cases:
- Detect spikes after social media campaigns
- Monitor daily order volume during Ramadan, weekends, and local sales events

### 4.2 Revenue per day

Purpose:
- Show daily revenue trend over the selected range

Recommended visualization:
- Line chart with a currency formatter

Data shape:
- date
- revenue

Use cases:
- Spot business growth or sudden revenue drops
- Compare revenue performance to historical ranges

### 4.3 Orders by status

Purpose:
- Show the current health of the order pipeline

Recommended visualization:
- Donut chart or stacked bar chart

Data shape:
- status
- count

Use cases:
- Identify backlog in pending fulfillment
- Monitor cancelled/returned rates

### 4.4 Top selling products

Purpose:
- Highlight products driving the most sales volume and revenue

Recommended visualization:
- Horizontal bar chart or ranked list

Data shape:
- productName
- quantitySold
- revenue

Use cases:
- Recognize best sellers
- Decide inventory and merchandising focus

### 4.5 Top customers

Purpose:
- Highlight the most valuable or most frequent customers

Recommended visualization:
- Ranked table or horizontal bar chart

Data shape:
- customerName
- orderCount
- totalSpent

Use cases:
- Support repeat business actions
- Spot high-value customers that should be prioritized

### Chart implementation notes

- Use a wrapper component around a lightweight chart library such as Recharts
- Keep all chart data server-fetched and precomputed when possible
- Prefer one shared service per chart dataset to keep logic consistent

---

## 5. Database requirements

### 5.1 Required changes

No major database redesign is required for Phase 5.

The existing schema already supports the dashboard requirements through:
- Order
- OrderItem
- Customer
- Product
- Organization
- Membership

### 5.2 Recommended indexes and query support

The dashboard should benefit from the following indexed access patterns:
- Order: organizationId + createdAt
- Order: organizationId + status + createdAt
- OrderItem: orderId
- OrderItem: productId
- Customer: organizationId + createdAt
- Product: organizationId + status

### 5.3 Optional future enhancement

If the dashboard becomes heavy with many historical records, a lightweight analytics snapshot table can be added later for precomputed daily metrics. This is optional and should not block Phase 5.

### 5.4 Data considerations for multi-tenancy

Every dashboard query must include organizationId and respect the active membership context. No dashboard endpoint should ever query across organizations.

---

## 6. Server actions and service layer architecture

### 6.1 Service layer responsibilities

The service layer should contain the following functions:
- getDashboardSummary(params)
- getDashboardOrdersSeries(params)
- getDashboardRevenueSeries(params)
- getDashboardStatusBreakdown(params)
- getDashboardTopProducts(params)
- getDashboardTopCustomers(params)
- getDashboardRecentOrders(params)
- getDashboardOperationalAlerts(params)

Each service should:
- resolve the active organization from the current session
- enforce tenant scoping
- apply filters for date range, status, source, payment method, and product/customer context
- return typed DTOs suitable for the UI

### 6.2 Server actions

Because the dashboard is primarily read-only, the recommended pattern is:
- Use server components directly with service-layer calls
- Keep server actions for mutations only, such as exporting data or triggering a refresh if needed

Optional server actions for Phase 5:
- exportDashboardCsv(formData)
- refreshDashboardCache()

### 6.3 DTO design

Each service should return a compact structure such as:
- summary
- charts
- tables
- alerts

This keeps the page component thin and makes the dashboard easy to evolve.

---

## 7. API endpoints required

The dashboard can be implemented without a dedicated client-side API layer, but the following endpoints are recommended if the app later needs richer client interactivity or future mobile consumption.

### 7.1 Required endpoints

- GET /api/dashboard/summary
  - Returns KPI values and trend deltas

- GET /api/dashboard/orders-series
  - Returns daily order counts

- GET /api/dashboard/revenue-series
  - Returns daily revenue values

- GET /api/dashboard/status-breakdown
  - Returns order counts by status

- GET /api/dashboard/top-products
  - Returns top-selling products

- GET /api/dashboard/top-customers
  - Returns top customers by volume or revenue

- GET /api/dashboard/recent-orders
  - Returns latest orders for the active organization

### 7.2 Optional endpoints

- GET /api/dashboard/export
- GET /api/dashboard/alerts

### 7.3 API security requirements

All endpoints must:
- require an authenticated session
- resolve the active organization from membership
- enforce role-based access
- ensure the tenant scope is always applied

---

## 8. Performance strategy for thousands of stores

The dashboard must remain efficient even when many stores are active in the same database.

### 8.1 Query strategy

- Always include organizationId in every dashboard query
- Use narrowly scoped date filters to reduce row counts
- Select only the columns needed by the UI
- Avoid N+1 queries by using relational includes only where necessary

### 8.2 Aggregation strategy

- Use SQL aggregation for KPI and chart calculations where possible
- Prefer grouped queries instead of loading full order sets into memory
- Keep the initial page load focused on summary data and recent activity only

### 8.3 Caching strategy

- Cache dashboard summaries for short periods using revalidation or a cache layer
- The dashboard should be considered a read-heavy workload and can tolerate slightly stale values in exchange for speed
- Recommended initial approach: revalidate every 5 to 15 minutes for summary data

### 8.4 Scaling strategy

If traffic grows significantly:
- Introduce precomputed analytics snapshots for daily summary data
- Add read replicas or a dedicated reporting path later
- Keep the current schema intact and add derived data structures instead of rewriting the core models

---

## 9. Security and permission considerations

### 9.1 Authentication and authorization

The dashboard should only be accessible to authenticated users with an active membership in an organization.

### 9.2 Permission model

At minimum:
- OWNER, ADMIN: full dashboard access
- CONFIRMATION_AGENT: access to operational KPIs and order insights, but not full store configuration
- DELIVERY_AGENT: limited visibility focused on fulfillment and current order state
- VIEWER: read-only access to summary and reporting views

### 9.3 Tenant isolation

The most important rule is strict multi-tenant enforcement:
- every service must resolve organizationId from the authenticated user context
- no dashboard query may run without tenant scoping
- the UI should never expose data for a different organization

### 9.4 Data sensitivity

Revenue, customer details, and order history should be treated as sensitive business data. Access should be logged and restricted to the appropriate roles.

---

## 10. Responsive UI layout using shadcn/ui

### 10.1 Layout structure

- Sidebar on large screens
- Collapsible navigation on smaller screens
- Main content area with top summary bar and dashboard sections

### 10.2 Card layout

Recommended layout:
- Mobile: single column
- Tablet: two columns
- Desktop: 4-column KPI row or 2-column grid depending on screen width

### 10.3 Recommended components

Use the existing shadcn/ui-style primitives and add wrappers for:
- Card
- Button
- Select
- Tabs
- Skeleton
- Table
- Badge
- Separator

### 10.4 Chart container behavior

Each chart should:
- resize responsively
- support mobile-friendly legends and axis labels
- preserve readable values on smaller devices

### 10.5 Dashboard content order

On mobile, the order should be:
1. KPI cards
2. Summary chart
3. Status breakdown
4. Top products/customers
5. Recent orders

---

## 11. Empty states, loading states, and error handling

### 11.1 Loading states

The dashboard should show:
- skeleton cards for KPI metrics
- skeleton placeholders for charts
- skeleton rows for recent orders and tables

### 11.2 Empty states

When there is no data yet, show:
- a friendly empty state for KPI cards if no orders exist
- a chart placeholder with a message such as “No orders yet”
- a helpful CTA such as “Create your first order”

### 11.3 Error handling

The dashboard should support:
- a full-page error fallback for unexpected failures
- inline error messages for chart failures
- a retry action for failed data loads

### 11.4 Progressive enhancement

The initial page should still render meaningful content even if one chart fails to load. Failing widgets should degrade gracefully rather than break the entire dashboard.

---

## 12. Algeria-specific business insights

The dashboard should not be a generic e-commerce analytics screen. It should reflect the realities of Algerian merchants and order workflows.

### 12.1 Recommended business insights

1. COD vs prepaid mix
   - Highlight how much of revenue is collected by cash on delivery versus prepaid orders

2. Order pipeline by status
   - Show how many orders are still pending confirmation, packed, or shipped

3. Delivery pressure by region
   - Aggregate by wilaya or commune where available

4. Return and cancellation rate
   - Important for sellers dealing with COD uncertainty and fake orders

5. Customer risk signals
   - Highlight blacklisted or repeat customers where relevant

6. Product velocity
   - Show top products by quantity sold and revenue to support restocking decisions

7. Daily freshness
   - Highlight whether the store is processing orders steadily or falling behind

8. Confirmation workload
   - If confirmation calls are part of the workflow, show how many orders are awaiting confirmation

These insights should make the dashboard feel operationally useful to real merchants rather than purely analytical.

---

## 13. Step-by-step implementation plan

### Step 1 — Define dashboard DTOs
- Create the response shapes for KPI cards, chart datasets, recent orders, and alerts

### Step 2 — Add service layer methods
- Implement tenant-scoped services for summary, series, breakdowns, and recent orders

### Step 3 — Add supporting data queries
- Ensure the queries use correct organizationId filters and efficient Prisma aggregation

### Step 4 — Build the dashboard page shell
- Render KPI cards, chart containers, recent activity, and empty/loading states

### Step 5 — Add chart widgets
- Implement orders per day, revenue per day, status breakdown, top products, and top customers

### Step 6 — Add filters and date-range controls
- Include quick ranges such as today, week, month, and custom date selection

### Step 7 — Add error and empty states
- Ensure each major widget degrades gracefully and offers a clear message

### Step 8 — Add performance optimizations
- Add caching, query pruning, and data shaping for future scale

### Step 9 — Validate roles and tenant boundaries
- Confirm that OWNER, ADMIN, and other roles see the correct data and that tenant isolation is enforced

### Step 10 — Polish for local business workflows
- Add Algeria-specific labels, summaries, and operational hints to make the dashboard feel native to the target market

---

## 14. Implementation guardrails

- Do not add dashboard logic that bypasses tenant scoping
- Keep the dashboard readable and fast for first-time merchants
- Favor server-rendered summaries over heavy client state
- Avoid over-engineering the first version; build the essential widgets first and expand later
- Keep the architecture aligned with the current service/action pattern already present in the codebase
