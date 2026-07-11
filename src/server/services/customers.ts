import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { customerSchema } from '@/lib/validations/customers';
import type { Prisma } from '@prisma/client';

async function getOrganizationId() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE'
    },
    select: { organizationId: true },
    orderBy: { createdAt: 'asc' }
  });

  if (!membership?.organizationId) {
    throw new Error('Organization not found');
  }

  return membership.organizationId;
}

export async function listCustomers(params: { search?: string; isBlacklisted?: string; page?: number; pageSize?: number }) {
  const organizationId = await getOrganizationId();
  const search = params.search?.trim();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.CustomerWhereInput = {
    organizationId,
    deletedAt: null,
    ...(search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    } : {}),
    ...(params.isBlacklisted === 'true' ? { isBlacklisted: true } : {}),
    ...(params.isBlacklisted === 'false' ? { isBlacklisted: false } : {})
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        wilaya: true,
        commune: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.customer.count({ where })
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function getCustomer(id: string) {
  const organizationId = await getOrganizationId();
  return prisma.customer.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: { wilaya: true, commune: true, blacklistedBy: { select: { name: true } } }
  });
}

export async function createCustomer(input: unknown) {
  const organizationId = await getOrganizationId();
  const parsed = customerSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('Invalid customer data');
  }

  return prisma.customer.create({
    data: {
      organizationId,
      ...parsed.data,
      altPhone: parsed.data.altPhone || null,
      notes: parsed.data.notes || null
    }
  });
}

export async function updateCustomer(id: string, input: unknown) {
  const organizationId = await getOrganizationId();
  const parsed = customerSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('Invalid customer data');
  }

  return prisma.customer.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: {
      ...parsed.data,
      altPhone: parsed.data.altPhone || null,
      notes: parsed.data.notes || null
    }
  });
}

export async function deleteCustomer(id: string) {
  const organizationId = await getOrganizationId();
  return prisma.customer.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date() }
  });
}

export async function getReferenceData() {
  const [wilayas, communes] = await Promise.all([
    prisma.wilaya.findMany({ orderBy: { nameFr: 'asc' } }),
    prisma.commune.findMany({ orderBy: { nameFr: 'asc' } })
  ]);

  return { wilayas, communes };
}

/**
 * Blacklists or un-blacklists a customer with a structured audit trail
 * (who, when, why) instead of a raw checkbox — the primary path for this
 * decision. A reason is required when blacklisting.
 */
export async function toggleCustomerBlacklist(id: string, input: { blacklisted: boolean; reason?: string }) {
  const organizationId = await getOrganizationId();
  const customer = await prisma.customer.findFirst({ where: { id, organizationId, deletedAt: null } });

  if (!customer) {
    throw new Error('Customer not found');
  }

  if (input.blacklisted && !input.reason?.trim()) {
    throw new Error('A reason is required to blacklist a customer.');
  }

  const session = await getSession();
  const actingUserId = session?.user?.id ?? null;

  return prisma.customer.update({
    where: { id },
    data: input.blacklisted
      ? { isBlacklisted: true, blacklistedAt: new Date(), blacklistedById: actingUserId, blacklistReason: input.reason?.trim() }
      : { isBlacklisted: false, blacklistedAt: null, blacklistedById: null, blacklistReason: null }
  });
}

export interface CustomerOrderStats {
  totalOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  deliveredOrders: number;
  cancellationRate: number;
}

/**
 * Order-outcome history for a customer — the signal that turns "a phone
 * number that repeatedly no-shows or cancels COD orders" into a visible,
 * actionable flag instead of institutional memory.
 */
export async function getCustomerOrderStats(customerId: string): Promise<CustomerOrderStats> {
  const organizationId = await getOrganizationId();

  const rows = await prisma.order.groupBy({
    by: ['status'],
    where: { organizationId, customerId },
    _count: { id: true }
  });

  const totalOrders = rows.reduce((sum, row) => sum + row._count.id, 0);
  const cancelledOrders = rows.find((row) => row.status === 'CANCELLED')?._count.id ?? 0;
  const returnedOrders = rows.find((row) => row.status === 'RETURNED')?._count.id ?? 0;
  const deliveredOrders = rows.find((row) => row.status === 'DELIVERED')?._count.id ?? 0;
  const badOutcomes = cancelledOrders + returnedOrders;

  return {
    totalOrders,
    cancelledOrders,
    returnedOrders,
    deliveredOrders,
    cancellationRate: totalOrders > 0 ? Math.round((badOutcomes / totalOrders) * 100) : 0
  };
}

const REPEAT_OFFENDER_MIN_BAD_ORDERS = 2;
const REPEAT_OFFENDER_MIN_RATE = 40;

export interface RepeatOffenderItem {
  id: string;
  fullName: string;
  phone: string;
  cancelledOrders: number;
  returnedOrders: number;
  totalOrders: number;
  cancellationRate: number;
}

/**
 * Customers who aren't blacklisted yet but show a risky pattern of
 * cancelled/returned COD orders — surfaced so a manager can review and
 * decide whether to blacklist, rather than relying on staff remembering.
 */
export async function getRepeatOffenders(): Promise<RepeatOffenderItem[]> {
  const organizationId = await getOrganizationId();

  const rows = await prisma.$queryRaw<
    Array<{ id: string; fullName: string; phone: string; cancelledOrders: number; returnedOrders: number; totalOrders: number }>
  >`
    SELECT c."id" AS "id",
           c."fullName" AS "fullName",
           c."phone" AS "phone",
           COUNT(*) FILTER (WHERE o."status" = 'CANCELLED')::int AS "cancelledOrders",
           COUNT(*) FILTER (WHERE o."status" = 'RETURNED')::int AS "returnedOrders",
           COUNT(o."id")::int AS "totalOrders"
    FROM "Customer" c
    INNER JOIN "Order" o ON o."customerId" = c."id"
    WHERE c."organizationId" = ${organizationId}
      AND c."deletedAt" IS NULL
      AND c."isBlacklisted" = false
    GROUP BY c."id", c."fullName", c."phone"
    HAVING COUNT(*) FILTER (WHERE o."status" IN ('CANCELLED', 'RETURNED')) >= ${REPEAT_OFFENDER_MIN_BAD_ORDERS}
    ORDER BY "cancelledOrders" + "returnedOrders" DESC
    LIMIT 10
  `;

  return rows
    .map((row) => ({
      ...row,
      cancellationRate: row.totalOrders > 0 ? Math.round(((row.cancelledOrders + row.returnedOrders) / row.totalOrders) * 100) : 0
    }))
    .filter((row) => row.cancellationRate >= REPEAT_OFFENDER_MIN_RATE);
}
