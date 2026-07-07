import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { productSchema, categorySchema } from '@/lib/validations/products';
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

export async function listProducts(params: { search?: string; status?: string; categoryId?: string; page?: number; pageSize?: number }) {
  const organizationId = await getOrganizationId();
  const search = params.search?.trim();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProductWhereInput = {
    organizationId,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ]
    } : {}),
    ...(params.status ? { status: params.status as 'ACTIVE' | 'INACTIVE' } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.product.count({ where })
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export async function getProduct(id: string) {
  const organizationId = await getOrganizationId();
  return prisma.product.findFirst({
    where: { id, organizationId },
    include: { category: true }
  });
}

export async function listCategories() {
  const organizationId = await getOrganizationId();
  return prisma.category.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' }
  });
}

export async function createCategory(name: string) {
  const organizationId = await getOrganizationId();
  const parsed = categorySchema.safeParse({ name });

  if (!parsed.success) {
    throw new Error('Invalid category data');
  }

  return prisma.category.create({
    data: { organizationId, name: parsed.data.name }
  });
}

export async function createProduct(input: unknown) {
  const organizationId = await getOrganizationId();
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('Invalid product data');
  }

  return prisma.product.create({
    data: {
      organizationId,
      ...parsed.data,
      cost: parsed.data.cost ? Number(parsed.data.cost) : null,
      categoryId: parsed.data.categoryId || null,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      imageUrls: parsed.data.imageUrls || []
    }
  });
}

export async function updateProduct(id: string, input: unknown) {
  const organizationId = await getOrganizationId();
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('Invalid product data');
  }

  return prisma.product.updateMany({
    where: { id, organizationId },
    data: {
      ...parsed.data,
      cost: parsed.data.cost ? Number(parsed.data.cost) : null,
      categoryId: parsed.data.categoryId || null,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      imageUrls: parsed.data.imageUrls || []
    }
  });
}

export async function deleteProduct(id: string) {
  const organizationId = await getOrganizationId();
  return prisma.product.deleteMany({ where: { id, organizationId } });
}
