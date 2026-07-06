# DZ Orders — Product & Technical Architecture

Status: **proposal, not yet approved**. No application code has been written against this document.

---

## 1. Critique of the original brief

The original spec (auth, dashboard, customers, products, orders, statistics, settings) is a solid **single-store order manager**. But you said the goal is to *sell this to Algerian businesses* and operate at 100,000-user scale. Read literally, the spec describes one store's data model. Sold as a SaaS, that's wrong: you need one deployment serving **thousands of independent stores**, each with its own customers, products, and orders, completely isolated from each other. That single change — going multi-tenant — touches almost every table and every query, which is why it has to be decided now, before schema or code.

Beyond that, the spec is also missing the features that actually distinguish a *sellable* product in this specific market, listed below.

## 2. Missing features — Algeria-specific realities

These aren't generic "nice to haves" — they reflect how Facebook/Instagram/TikTok sellers in Algeria actually operate, and their absence would make the product feel incomplete to a real buyer on first demo:

1. **Cash on Delivery is the default payment method.** Almost no order is prepaid. The product needs an explicit COD reconciliation view: money collected by the delivery company vs money remitted to the merchant, per delivery company, per period.
2. **Order confirmation calls.** Sellers get large volumes of fake/prank/duplicate orders from social media. The near-universal workflow is: order comes in as "New" → an agent calls the customer → outcome logged (confirmed / no answer / cancelled) → only then does it move to "Confirmed". This needs its own entity (call attempts, outcome, agent, timestamp), not just a status field.
3. **Delivery company integration.** Sellers ship almost exclusively through third-party delivery companies (e.g. Yalidine, ZR Express, Maystro, NOEST, and others), each with their own per-wilaya home-delivery and stop-desk (bureau) pricing, and several expose APIs for creating shipments and tracking status. The schema needs a delivery-company concept and a per-wilaya pricing table from day one, even if the actual API integration ships later.
4. **Duplicate / blacklisted customers.** A phone number that repeatedly no-shows or cancels COD orders is one of the top pain points sellers mention. Needs a flag on the customer record and a way to surface repeat offenders at order-entry time.
5. **A public order-intake form.** Facebook/Instagram/TikTok don't have a native "order" object — sellers either take orders by DM/comment and enter them manually, or share a link to a simple order form. Supporting a per-store hosted order form (name, phone, wilaya, commune, product) is a major differentiator and a direct source of orders, not just an import feature.
6. **Wilaya/commune reference data.** Algeria's 58 wilayas and their communes are structural, not user data — they must be seeded once, shared read-only across all tenants, and used everywhere an address is entered (cascading select, not free text) so delivery pricing and statistics can key off them reliably.
7. **Team roles beyond "owner".** Real stores have a confirmation agent (calls customers), a delivery/warehouse person (packs and hands off), and an owner (sees revenue). Their screens and permissions differ. The original "Users / Roles" line item under Settings needs to become a first-class permission model, not an afterthought.
8. **Billing for the SaaS itself.** You are the vendor now. The product needs its own subscription/plan/trial model, and — since it's selling to Algerian merchants — a local payment rail (e.g. Chargily/EDAHABIA/CIB, or manual bank transfer confirmation) matters more than Stripe here.
9. **CSV/Excel export of orders.** Merchants routinely need to hand a list of orders to a delivery company or reconcile in Excel; this is a basic expectation, not a stretch feature.
10. **In-app notifications & audit log.** With multiple team members touching the same orders, "who changed this and when" and "notify me when an order is confirmed/returned" stop being optional at any real team size.

None of this contradicts your original list — it fills the gaps between "a working CRUD app" and "a thing a merchant would actually pay for and trust with their money."

## 3. Multi-tenancy decision

**Decision: single database, shared schema, `organizationId` on every tenant-scoped table (row-level multi-tenancy), enforced at the query layer.**

Why not alternatives:
- *One database per tenant*: cleanest isolation, but unworkable operationally at 100k tenants (migrations, connection pools, cost) — this is an agency-tool pattern, not a SaaS-at-scale pattern.
- *Schema-per-tenant in Postgres*: better than one DB per tenant, still becomes a migration and connection-pool nightmare well before 100k tenants.
- *Shared schema with tenant column*: the industry-default choice for this exact profile (many small tenants, uniform schema, need for cross-tenant admin/reporting). Every service-layer query is scoped by `organizationId`, and it's enforced in one place (the service layer, never left to individual callers) so it can't be forgotten.

Global, tenant-independent tables: `Wilaya`, `Commune`, `DeliveryCompany`, `Plan`. Everything else carries `organizationId`.

## 4. Proposed database schema

UUID primary keys throughout. `createdAt`/`updatedAt` on every table. Soft delete via `deletedAt` (nullable) on every tenant-owned table — nothing a merchant creates is ever hard-deleted. Composite indexes are called out where they matter for query patterns (list views, search, uniqueness).

### Tenancy & identity
| Table | Key fields | Notes |
|---|---|---|
| `Organization` | name, slug (unique), logoUrl, phone, wilayaId, communeId, planId, trialEndsAt | one row per merchant/store |
| `User` | name, email (unique), passwordHash, emailVerified, image | a person; can belong to multiple orgs |
| `Membership` | userId, organizationId, role, invitedAt, joinedAt, status | join table; unique (userId, organizationId); `role` enum: OWNER, ADMIN, CONFIRMATION_AGENT, DELIVERY_AGENT, VIEWER |
| `Account` / `Session` / `VerificationToken` | — | standard Auth.js tables |

### Reference data (global, seeded)
| Table | Key fields | Notes |
|---|---|---|
| `Wilaya` | code, nameFr, nameAr | 58 rows, seeded once |
| `Commune` | wilayaId, nameFr, nameAr | seeded once; index on wilayaId |
| `DeliveryCompany` | name, logoUrl, apiSupported | e.g. Yalidine, ZR Express, Maystro, NOEST, "Own delivery" |
| `Plan` | name, priceMonthly, maxOrdersPerMonth, maxUsers, features (json) | SaaS pricing tiers |

### Catalog (tenant-scoped)
| Table | Key fields | Notes |
|---|---|---|
| `Category` | organizationId, name, parentId | index (organizationId, parentId) |
| `Product` | organizationId, categoryId, name, price, cost, sku, barcode, stock, imageUrls[], status | unique (organizationId, barcode); index (organizationId, name) for search |

### Customers (tenant-scoped)
| Table | Key fields | Notes |
|---|---|---|
| `Customer` | organizationId, fullName, phone, altPhone, wilayaId, communeId, address, notes, isBlacklisted, ordersCount | unique (organizationId, phone); index (organizationId, phone) for fast lookup on order entry |

### Orders (tenant-scoped)
| Table | Key fields | Notes |
|---|---|---|
| `Order` | organizationId, orderNumber, customerId, phoneSnapshot, wilayaId, communeId, addressSnapshot, deliveryCompanyId, deliveryType, deliveryCost, subtotal, discount, total, status, source, confirmationAttempts, confirmedById, confirmedAt | unique (organizationId, orderNumber); index (organizationId, status, createdAt) for the dashboard/list views; `status` enum: NEW, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURNED; `source` enum: FACEBOOK, INSTAGRAM, TIKTOK, WHATSAPP, MANUAL, PUBLIC_FORM |
| `OrderItem` | orderId, productId, productNameSnapshot, unitPriceSnapshot, quantity, lineTotal | snapshots protect historical orders from later product edits |
| `OrderStatusHistory` | orderId, fromStatus, toStatus, changedById, note | powers the order-timeline UI and audit trail |
| `OrderCallLog` | orderId, agentId, outcome, note, calledAt | outcome enum: NO_ANSWER, CONFIRMED, CANCELLED, RESCHEDULED |

### Delivery pricing (tenant-scoped, keyed to global wilayas)
| Table | Key fields | Notes |
|---|---|---|
| `DeliveryPricing` | organizationId, deliveryCompanyId, wilayaId, homeDeliveryPrice, stopDeskPrice | unique (organizationId, deliveryCompanyId, wilayaId) |

### Intake, billing, ops
| Table | Key fields | Notes |
|---|---|---|
| `PublicOrderForm` | organizationId, slug (unique), fieldsConfig (json), themeColor, isActive | powers the shareable order-form link |
| `Subscription` | organizationId, planId, status, currentPeriodEnd, provider, providerRef | SaaS billing for the merchant's account |
| `Notification` | organizationId, userId, type, payload (json), readAt | in-app notifications |
| `AuditLog` | organizationId, userId, action, entityType, entityId, meta (json) | "who did what" |

The diagram below shows the core relationships (reference data and billing/ops tables omitted for readability — full detail is in the tables above).

## 5. Folder structure (Clean Architecture, feature-organized)

```
dz-orders/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # wilayas, communes, delivery companies, plans
├── src/
│   ├── app/
│   │   ├── (auth)/                 # login, register, forgot-password, verify-email — public
│   │   ├── (dashboard)/            # org-scoped app shell: dashboard, orders, customers,
│   │   │                           # products, statistics, settings — requires session + org
│   │   ├── order/[slug]/           # public order-intake form, no auth required
│   │   └── api/                    # auth.js + uploadthing route handlers only
│   ├── components/
│   │   ├── ui/                     # shadcn primitives (button, input, dialog, table…)
│   │   ├── shared/                 # app-wide reusable pieces (page headers, empty states…)
│   │   └── {orders,customers,products,dashboard,settings}/  # feature-specific components
│   ├── server/
│   │   ├── actions/                # "use server" — thin: validate (Zod) → call service → revalidate
│   │   └── services/                # business logic, tenant-scoped, framework-agnostic
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # Auth.js config
│   │   ├── email.ts                # transactional email sending
│   │   ├── permissions.ts          # role → permission checks
│   │   └── validations/            # Zod schemas, shared client + server
│   ├── hooks/                       # TanStack Query wrappers, useDebounce, etc.
│   ├── types/                       # shared domain types
│   └── config/                      # site config, nav config, plan config
├── docker-compose.yml               # postgres + app
├── Dockerfile
└── .env.example
```

## 6. Development roadmap

**Phase 0 — Foundation**
Project scaffold, Docker + Postgres, Prisma schema + migrations + seed data (wilayas/communes/delivery companies/plans), Auth.js (register/login/verify/forgot-password), organization creation on signup, base dashboard shell with sidebar/topbar, dark/light mode.

**Phase 1 — MVP** (see scope below)
Customers CRUD, Products CRUD, Orders CRUD with the 7-status pipeline, dashboard KPIs, manual per-wilaya delivery cost entry, single-owner settings, CSV export of orders.

**Phase 2 — Team & intake**
Membership/roles (confirmation agent, delivery agent), order confirmation call logging, public order-intake form, in-app notifications, daily/weekly/monthly statistics & charts.

**Phase 3 — Integrations & monetization**
Delivery company API integration (shipment creation + tracking sync), SMS/WhatsApp customer notifications, shipping label/barcode printing, SaaS subscription billing (local payment rail), audit log.

**Phase 4 — Scale & polish**
Product variants, multi-store per account, Arabic RTL layout, advanced analytics (confirmation rate per agent, delivery-company performance comparison), PWA/mobile.

## 7. MVP definition (what ships to the first paying customer)

**In scope:** account + org signup with email verification, customer CRUD with wilaya/commune pickers and search, product CRUD with image/stock/price/category/barcode, order creation with the full status pipeline and per-order status history, dashboard (today's orders, revenue, pending/delivered/cancelled counts, weekly sales chart, monthly revenue), store settings (name/logo), CSV export.

**Explicitly deferred:** public order form, delivery-company API sync, SMS/WhatsApp, SaaS billing (can be invoiced manually at this stage), multi-role permissions beyond a single owner login, audit log.

Reasoning: this scope alone already beats a merchant's current tool (a Facebook Messenger inbox + a paper notebook or an Excel sheet), is achievable without any third-party API dependency, and every deferred item slots into the existing schema without a rewrite — the tables for them already exist in section 4, they're just unused until their phase arrives.

---

**Next decision needed from you:** approve or amend this document, then I'll proceed to Step 1 (project scaffold) file by file.
