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
    include: { wilaya: true, commune: true }
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
