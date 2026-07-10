import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { orderSchema } from '@/lib/validations/orders';
import { Prisma, type OrderStatus, type CallOutcome, type CancellationReason } from '@prisma/client';

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

export function buildOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${suffix}`;
}

export async function listOrders(params: { search?: string; status?: string; paymentMethod?: string; page?: number; pageSize?: number }) {
  const organizationId = await getOrganizationId();
  const search = params.search?.trim();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.OrderWhereInput = {
    organizationId,
    ...(search ? {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { phoneSnapshot: { contains: search, mode: 'insensitive' } },
        { addressSnapshot: { contains: search, mode: 'insensitive' } },
        { customer: { fullName: { contains: search, mode: 'insensitive' } } }
      ]
    } : {}),
    ...(params.status ? { status: params.status as OrderStatus } : {}),
    ...(params.paymentMethod ? { paymentMethod: params.paymentMethod as 'COD' | 'PREPAID' } : {})
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: true,
        deliveryCompany: true,
        wilaya: true,
        commune: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.order.count({ where })
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function getOrder(id: string) {
  const organizationId = await getOrganizationId();
  return prisma.order.findFirst({
    where: { id, organizationId },
    include: {
      customer: true,
      wilaya: true,
      commune: true,
      deliveryCompany: true,
      items: {
        include: {
          product: true
        }
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' }
      },
      callLogs: {
        include: { agent: true },
        orderBy: { calledAt: 'desc' }
      },
      assignedAgent: true
    }
  });
}

export async function getOrderReferenceData() {
  const organizationId = await getOrganizationId();

  const [customers, products, wilayas, communes, deliveryCompanies] = await Promise.all([
    prisma.customer.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        wilaya: true,
        commune: true
      },
      orderBy: { fullName: 'asc' }
    }),
    prisma.product.findMany({
      where: { organizationId, status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    }),
    prisma.wilaya.findMany({ orderBy: { nameFr: 'asc' } }),
    prisma.commune.findMany({ orderBy: { nameFr: 'asc' } }),
    prisma.deliveryCompany.findMany({ orderBy: { name: 'asc' } })
  ]);

  return { customers, products, wilayas, communes, deliveryCompanies };
}

export async function createOrder(input: unknown) {
  const organizationId = await getOrganizationId();
  const parsed = orderSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('Invalid order data');
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      organizationId
    }
  });

  if (products.length !== productIds.length) {
    throw new Error('One or more selected products are invalid');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const subtotal = parsed.data.items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    const unitPrice = product?.price ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const total = subtotal + parsed.data.deliveryCost - parsed.data.discount;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        organizationId,
        orderNumber: buildOrderNumber(),
        customerId: parsed.data.customerId || null,
        phoneSnapshot: parsed.data.phoneSnapshot,
        wilayaId: parsed.data.wilayaId,
        communeId: parsed.data.communeId,
        addressSnapshot: parsed.data.addressSnapshot,
        deliveryCompanyId: parsed.data.deliveryCompanyId || null,
        deliveryType: parsed.data.deliveryType,
        deliveryCost: parsed.data.deliveryCost,
        subtotal,
        discount: parsed.data.discount,
        total: Math.max(0, total),
        status: parsed.data.status,
        source: parsed.data.source,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null
      }
    });

    await tx.orderItem.createMany({
      data: parsed.data.items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          orderId: order.id,
          productId: item.productId,
          productNameSnapshot: product?.name ?? '',
          unitPriceSnapshot: product?.price ?? 0,
          quantity: item.quantity,
          lineTotal: (product?.price ?? 0) * item.quantity
        };
      })
    });

    return order;
  });
}

export async function updateOrder(id: string, input: unknown) {
  const organizationId = await getOrganizationId();
  const parsed = orderSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('Invalid order data');
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      organizationId
    }
  });

  if (products.length !== productIds.length) {
    throw new Error('One or more selected products are invalid');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const subtotal = parsed.data.items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    const unitPrice = product?.price ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const total = subtotal + parsed.data.deliveryCost - parsed.data.discount;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.updateMany({
      where: { id, organizationId },
      data: {
        customerId: parsed.data.customerId || null,
        phoneSnapshot: parsed.data.phoneSnapshot,
        wilayaId: parsed.data.wilayaId,
        communeId: parsed.data.communeId,
        addressSnapshot: parsed.data.addressSnapshot,
        deliveryCompanyId: parsed.data.deliveryCompanyId || null,
        deliveryType: parsed.data.deliveryType,
        deliveryCost: parsed.data.deliveryCost,
        subtotal,
        discount: parsed.data.discount,
        total: Math.max(0, total),
        status: parsed.data.status,
        source: parsed.data.source,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null
      }
    });

    await tx.orderItem.deleteMany({ where: { orderId: id } });
    await tx.orderItem.createMany({
      data: parsed.data.items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          orderId: id,
          productId: item.productId,
          productNameSnapshot: product?.name ?? '',
          unitPriceSnapshot: product?.price ?? 0,
          quantity: item.quantity,
          lineTotal: (product?.price ?? 0) * item.quantity
        };
      })
    });

    return order;
  });
}

export async function deleteOrder(id: string) {
  const organizationId = await getOrganizationId();
  return prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: id } });
    return tx.order.deleteMany({ where: { id, organizationId } });
  });
}

export async function updateOrderStatus(id: string, status: string, note?: string) {
  const organizationId = await getOrganizationId();
  const order = await prisma.order.findFirst({ where: { id, organizationId } });

  if (!order) {
    throw new Error('Order not found');
  }

  const session = await getSession();
  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        ...(status === 'CONFIRMED' && !order.confirmedAt ? { confirmedById: session?.user?.id ?? null, confirmedAt: new Date() } : {})
      }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: order.status,
        toStatus: updatedOrder.status,
        changedById: session?.user?.id ?? null,
        note: note || null
      }
    });

    return updatedOrder;
  });

  return updated;
}

/**
 * Records a confirmation-call attempt for an order (Phase 6). Every attempt is
 * logged with its agent, outcome, and timestamp. The order can only progress
 * out of NEW/CALLING as the direct result of a logged call outcome:
 *   - CONFIRMED  -> order moves CONFIRMED, then automatically READY_TO_SHIP
 *   - CANCELLED  -> order moves CANCELLED (requires a cancellationReason)
 *   - any other outcome (no answer, busy, phone off, wrong number, refused,
 *     duplicate, rescheduled, callback requested) -> order enters/stays CALLING
 * A follow-up reminder (nextCallAt) can be attached to any non-final outcome.
 * The acting agent is auto-assigned to the order on first contact if nobody
 * is assigned yet.
 */
export async function logOrderCallAttempt(
  id: string,
  input: { outcome: CallOutcome; note?: string; nextCallAt?: Date; cancellationReason?: CancellationReason }
) {
  const organizationId = await getOrganizationId();
  const order = await prisma.order.findFirst({ where: { id, organizationId } });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'NEW' && order.status !== 'CALLING') {
    throw new Error('This order is no longer awaiting confirmation.');
  }

  if (input.outcome === 'CANCELLED' && !input.cancellationReason) {
    throw new Error('A cancellation reason is required.');
  }

  const session = await getSession();
  const agentId = session?.user?.id ?? null;
  const isFinal = input.outcome === 'CONFIRMED' || input.outcome === 'CANCELLED';

  const nextStatus: OrderStatus =
    input.outcome === 'CONFIRMED' ? 'READY_TO_SHIP' : input.outcome === 'CANCELLED' ? 'CANCELLED' : 'CALLING';

  return prisma.$transaction(async (tx) => {
    await tx.orderCallLog.create({
      data: {
        orderId: id,
        agentId,
        outcome: input.outcome,
        note: input.note || null,
        nextCallAt: isFinal ? null : input.nextCallAt ?? null,
        cancellationReason: input.outcome === 'CANCELLED' ? input.cancellationReason : null
      }
    });

    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        confirmationAttempts: { increment: 1 },
        assignedAgentId: order.assignedAgentId ?? agentId,
        nextCallAt: isFinal ? null : input.nextCallAt ?? order.nextCallAt,
        ...(input.outcome === 'CANCELLED'
          ? { cancellationReason: input.cancellationReason, cancellationNote: input.note || null }
          : {}),
        ...(nextStatus !== order.status
          ? {
              status: nextStatus,
              ...(input.outcome === 'CONFIRMED' ? { confirmedById: agentId, confirmedAt: new Date() } : {})
            }
          : {})
      }
    });

    if (nextStatus !== order.status) {
      if (input.outcome === 'CONFIRMED') {
        // Two history entries so the timeline reflects the real pipeline:
        // NEW/CALLING -> CONFIRMED -> READY_TO_SHIP
        await tx.orderStatusHistory.create({
          data: { orderId: id, fromStatus: order.status, toStatus: 'CONFIRMED', changedById: agentId, note: 'Confirmed by customer on call' }
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: 'CONFIRMED',
            toStatus: 'READY_TO_SHIP',
            changedById: agentId,
            note: 'Automatically queued for shipping after confirmation'
          }
        });
      } else {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: order.status,
            toStatus: nextStatus,
            changedById: agentId,
            note:
              input.outcome === 'CANCELLED'
                ? `Cancelled after call (${input.cancellationReason})`
                : `Confirmation call logged (${input.outcome})`
          }
        });
      }
    }

    return updatedOrder;
  });
}

/**
 * Assigns (or unassigns) the confirmation agent responsible for an order.
 * The candidate agent must be an active member of the same organization —
 * this is the multi-tenant guard that stops cross-tenant assignment.
 */
export async function assignOrderAgent(orderId: string, agentId: string | null) {
  const organizationId = await getOrganizationId();
  const order = await prisma.order.findFirst({ where: { id: orderId, organizationId } });

  if (!order) {
    throw new Error('Order not found');
  }

  if (agentId) {
    const membership = await prisma.membership.findFirst({
      where: { organizationId, userId: agentId, status: 'ACTIVE' }
    });

    if (!membership) {
      throw new Error('Selected agent is not an active member of this organization.');
    }
  }

  const session = await getSession();
  const actingUserId = session?.user?.id ?? null;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: orderId }, data: { assignedAgentId: agentId } });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: order.status,
        changedById: actingUserId,
        note: agentId ? 'Assigned confirmation agent' : 'Unassigned confirmation agent'
      }
    });

    return updated;
  });
}

/**
 * Active members eligible to be assigned as a confirmation agent, scoped to
 * the current organization (multi-tenant safe).
 */
export async function getOrganizationAgents() {
  const organizationId = await getOrganizationId();

  const memberships = await prisma.membership.findMany({
    where: {
      organizationId,
      status: 'ACTIVE',
      role: { in: ['OWNER', 'ADMIN', 'CONFIRMATION_AGENT'] }
    },
    include: { user: { select: { id: true, name: true } } }
  });

  return memberships
    .map((membership) => ({ id: membership.user.id, name: membership.user.name ?? 'Unnamed user' }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type OrderTimelineEvent =
  | { type: 'STATUS_CHANGE'; id: string; timestamp: Date; fromStatus: string; toStatus: string; note: string | null; actor: string | null }
  | {
      type: 'CALL_ATTEMPT';
      id: string;
      timestamp: Date;
      outcome: string;
      note: string | null;
      nextCallAt: Date | null;
      cancellationReason: string | null;
      actor: string | null;
    };

/**
 * A unified, chronological feed of everything that happened to an order:
 * status transitions and confirmation-call attempts, merged and sorted by
 * timestamp (most recent first).
 */
export async function getOrderTimeline(orderId: string): Promise<OrderTimelineEvent[]> {
  const organizationId = await getOrganizationId();
  const order = await prisma.order.findFirst({ where: { id: orderId, organizationId }, select: { id: true } });

  if (!order) {
    throw new Error('Order not found');
  }

  const [statusHistory, callLogs] = await Promise.all([
    prisma.orderStatusHistory.findMany({
      where: { orderId },
      include: { changedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.orderCallLog.findMany({
      where: { orderId },
      include: { agent: { select: { name: true } } },
      orderBy: { calledAt: 'desc' }
    })
  ]);

  const statusEvents: OrderTimelineEvent[] = statusHistory.map((entry) => ({
    type: 'STATUS_CHANGE',
    id: entry.id,
    timestamp: entry.createdAt,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    note: entry.note,
    actor: entry.changedBy?.name ?? null
  }));

  const callEvents: OrderTimelineEvent[] = callLogs.map((entry) => ({
    type: 'CALL_ATTEMPT',
    id: entry.id,
    timestamp: entry.calledAt,
    outcome: entry.outcome,
    note: entry.note,
    nextCallAt: entry.nextCallAt,
    cancellationReason: entry.cancellationReason,
    actor: entry.agent?.name ?? null
  }));

  return [...statusEvents, ...callEvents].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
