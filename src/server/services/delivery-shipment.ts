import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getProviderForCompany } from './delivery/registry';

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

async function loadShippableOrder(organizationId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId },
    include: {
      customer: true,
      wilaya: true,
      commune: true,
      items: true,
      deliveryCompany: true,
      organization: { include: { wilaya: true } }
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.trackingNumber) {
    throw new Error('This order already has a tracking number.');
  }

  if (!order.deliveryCompanyId || !order.deliveryCompany) {
    throw new Error('Select a delivery company for this order first.');
  }

  return order;
}

/**
 * Creates a shipment through the delivery company's API when this
 * organization has working credentials for it, otherwise throws a
 * 'MANUAL_ONLY' error the caller can use to fall back to manual entry.
 */
export async function createOrderShipment(orderId: string) {
  const organizationId = await getOrganizationId();
  const order = await loadShippableOrder(organizationId, orderId);

  if (!order.organization.wilaya) {
    throw new Error('Set your store\'s origin wilaya in Settings before creating shipments.');
  }

  const provider = getProviderForCompany(order.deliveryCompany!.name);
  const credential = await prisma.deliveryCompanyCredential.findFirst({
    where: { organizationId, deliveryCompanyId: order.deliveryCompanyId!, isActive: true }
  });

  if (!provider || !credential?.apiId || !credential?.apiToken) {
    throw new Error('MANUAL_ONLY');
  }

  const rawName = (order.customer?.fullName ?? order.phoneSnapshot).trim();
  const [firstName, ...rest] = rawName.split(/\s+/);
  const lastName = rest.join(' ');

  const result = await provider.createShipment(
    { apiId: credential.apiId, apiToken: credential.apiToken },
    {
      orderNumber: order.orderNumber,
      customerFirstName: firstName || 'Client',
      customerLastName: lastName || firstName || 'Client',
      phone: order.phoneSnapshot,
      address: order.addressSnapshot,
      fromWilayaName: order.organization.wilaya.nameFr,
      toWilayaName: order.wilaya.nameFr,
      toCommuneName: order.commune.nameFr,
      productLabel: order.items.map((item) => item.productNameSnapshot).join(', ') || order.orderNumber,
      codAmount: order.subtotal,
      isStopDesk: order.deliveryType === 'STOP_DESK'
    }
  );

  await prisma.order.update({
    where: { id: order.id },
    data: { trackingNumber: result.trackingNumber, shipmentCreatedAt: new Date() }
  });

  return result;
}

/** Manual fallback for delivery companies without an API integration yet. */
export async function setManualTrackingNumber(orderId: string, trackingNumber: string) {
  const organizationId = await getOrganizationId();
  const order = await loadShippableOrder(organizationId, orderId);

  return prisma.order.update({
    where: { id: order.id },
    data: { trackingNumber: trackingNumber.trim(), shipmentCreatedAt: new Date() }
  });
}
