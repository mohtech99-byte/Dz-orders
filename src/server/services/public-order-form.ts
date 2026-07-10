import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { buildOrderNumber } from '@/server/services/orders';
import { publicOrderSchema } from '@/lib/validations/public-order';

interface PublicFormFieldsConfig {
  headline?: string;
  subheadline?: string;
}

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

async function getOrganizationId() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    select: { organizationId: true },
    orderBy: { createdAt: 'asc' }
  });

  if (!membership?.organizationId) {
    throw new Error('Organization not found');
  }

  return membership.organizationId;
}

// ---------------------------------------------------------------------------
// Public (unauthenticated) side — resolves everything from the form's slug,
// never from a session.
// ---------------------------------------------------------------------------

export async function getPublicOrderForm(slug: string) {
  const form = await prisma.publicOrderForm.findUnique({
    where: { slug },
    include: { organization: true }
  });

  if (!form || !form.isActive || form.organization.deletedAt) {
    return null;
  }

  const [products, wilayas, communes] = await Promise.all([
    prisma.product.findMany({ where: { organizationId: form.organizationId, status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
    prisma.wilaya.findMany({ orderBy: { nameFr: 'asc' } }),
    prisma.commune.findMany({ orderBy: { nameFr: 'asc' } })
  ]);

  const config = (form.fieldsConfig as PublicFormFieldsConfig) ?? {};

  return { form, config, products, wilayas, communes };
}

export type PublicOrderSubmissionResult =
  | { status: 'success'; orderNumber: string }
  | { status: 'duplicate' }
  | { status: 'error'; message: string };

/**
 * Creates an order from a public storefront submission. Multi-tenant safe:
 * the organization is resolved strictly from the form's slug, and every
 * product lookup is scoped to that organization. Includes a honeypot check
 * and a short duplicate-submission window to absorb basic spam/double-clicks.
 */
export async function submitPublicOrder(slug: string, input: unknown): Promise<PublicOrderSubmissionResult> {
  const form = await prisma.publicOrderForm.findUnique({ where: { slug } });

  if (!form || !form.isActive) {
    return { status: 'error', message: 'This order form is not available right now.' };
  }

  const parsed = publicOrderSchema.safeParse(input);

  if (!parsed.success) {
    return { status: 'error', message: 'Please fill in all required fields correctly.' };
  }

  // Honeypot tripped — pretend success without persisting anything.
  if (parsed.data.website) {
    return { status: 'success', orderNumber: 'received' };
  }

  const organizationId = form.organizationId;

  const products = await prisma.product.findMany({
    where: { organizationId, status: 'ACTIVE', id: { in: parsed.data.items.map((item) => item.productId) } }
  });

  if (products.length !== parsed.data.items.length) {
    return { status: 'error', message: 'One or more selected products are no longer available.' };
  }

  const recentDuplicate = await prisma.order.findFirst({
    where: {
      organizationId,
      phoneSnapshot: parsed.data.phone,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) }
    }
  });

  if (recentDuplicate) {
    return { status: 'duplicate' };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const subtotal = parsed.data.items.reduce((sum, item) => sum + (productMap.get(item.productId)?.price ?? 0) * item.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { organizationId_phone: { organizationId, phone: parsed.data.phone } },
      update: {
        fullName: parsed.data.fullName,
        wilayaId: parsed.data.wilayaId,
        communeId: parsed.data.communeId,
        address: parsed.data.address
      },
      create: {
        organizationId,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        wilayaId: parsed.data.wilayaId,
        communeId: parsed.data.communeId,
        address: parsed.data.address
      }
    });

    const createdOrder = await tx.order.create({
      data: {
        organizationId,
        orderNumber: buildOrderNumber(),
        customerId: customer.id,
        phoneSnapshot: parsed.data.phone,
        wilayaId: parsed.data.wilayaId,
        communeId: parsed.data.communeId,
        addressSnapshot: parsed.data.address,
        deliveryType: 'HOME',
        deliveryCost: 0,
        subtotal,
        discount: 0,
        total: subtotal,
        status: 'NEW',
        source: 'PUBLIC_FORM',
        paymentMethod: 'COD',
        notes: parsed.data.notes || null
      }
    });

    await tx.orderItem.createMany({
      data: parsed.data.items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          orderId: createdOrder.id,
          productId: item.productId,
          productNameSnapshot: product?.name ?? '',
          unitPriceSnapshot: product?.price ?? 0,
          quantity: item.quantity,
          lineTotal: (product?.price ?? 0) * item.quantity
        };
      })
    });

    await tx.customer.update({ where: { id: customer.id }, data: { ordersCount: { increment: 1 } } });

    return createdOrder;
  });

  return { status: 'success', orderNumber: order.orderNumber };
}

// ---------------------------------------------------------------------------
// Authenticated settings-side management (merchant configures their form).
// ---------------------------------------------------------------------------

export async function getOwnPublicOrderForm() {
  const organizationId = await getOrganizationId();
  return prisma.publicOrderForm.findFirst({ where: { organizationId } });
}

export async function getOrCreatePublicOrderForm() {
  const organizationId = await getOrganizationId();
  const existing = await prisma.publicOrderForm.findFirst({ where: { organizationId } });

  if (existing) {
    return existing;
  }

  const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const slug = `${organization.slug}-${Math.random().toString(36).slice(2, 6)}`;

  return prisma.publicOrderForm.create({
    data: {
      organizationId,
      slug,
      isActive: true,
      fieldsConfig: {
        headline: `Order from ${organization.name}`,
        subheadline: 'Fill in your details and we will confirm by phone.'
      } satisfies PublicFormFieldsConfig
    }
  });
}

export async function togglePublicOrderForm(formId: string, isActive: boolean) {
  const organizationId = await getOrganizationId();
  return prisma.publicOrderForm.updateMany({ where: { id: formId, organizationId }, data: { isActive } });
}

export async function updatePublicOrderFormSettings(
  formId: string,
  input: { headline?: string; subheadline?: string; themeColor?: string }
) {
  const organizationId = await getOrganizationId();
  const form = await prisma.publicOrderForm.findFirst({ where: { id: formId, organizationId } });

  if (!form) {
    throw new Error('Form not found');
  }

  const currentConfig = (form.fieldsConfig as PublicFormFieldsConfig) ?? {};

  return prisma.publicOrderForm.update({
    where: { id: formId },
    data: {
      themeColor: input.themeColor || null,
      fieldsConfig: {
        headline: input.headline || currentConfig.headline,
        subheadline: input.subheadline || currentConfig.subheadline
      } satisfies PublicFormFieldsConfig
    }
  });
}
