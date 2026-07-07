import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { orderSchema } from '@/lib/validations/orders';
import { Prisma, type OrderStatus } from '@prisma/client';

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

function buildOrderNumber() {
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
      }
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
