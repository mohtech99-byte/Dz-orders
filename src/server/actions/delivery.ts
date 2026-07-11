'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { saveDeliveryCompanyCredential, testDeliveryCompanyCredential } from '@/server/services/delivery-credentials';
import { createOrderShipment, setManualTrackingNumber } from '@/server/services/delivery-shipment';
import { updateOrganizationOrigin } from '@/server/services/organization';

export async function saveDeliveryCredentialAction(deliveryCompanyId: string, formData: FormData) {
  const apiId = formData.get('apiId')?.toString() ?? '';
  const apiToken = formData.get('apiToken')?.toString() ?? '';
  await saveDeliveryCompanyCredential(deliveryCompanyId, { apiId, apiToken });
  revalidatePath('/settings');
}

export async function testDeliveryCredentialAction(deliveryCompanyId: string) {
  await testDeliveryCompanyCredential(deliveryCompanyId);
  revalidatePath('/settings');
}

export async function updateOrganizationOriginAction(formData: FormData) {
  const wilayaId = Number(formData.get('wilayaId'));
  const communeId = Number(formData.get('communeId'));
  await updateOrganizationOrigin({ wilayaId, communeId });
  revalidatePath('/settings');
}

export async function createShipmentAction(orderId: string) {
  try {
    await createOrderShipment(orderId);
  } catch (error) {
    if (error instanceof Error && error.message === 'MANUAL_ONLY') {
      redirect(`/orders/${orderId}?shipment=manual`);
    }
    redirect(`/orders/${orderId}?shipment=error`);
  }

  revalidatePath(`/orders/${orderId}`);
  redirect(`/orders/${orderId}?shipment=created`);
}

export async function setManualTrackingAction(orderId: string, formData: FormData) {
  const trackingNumber = formData.get('trackingNumber')?.toString() ?? '';
  await setManualTrackingNumber(orderId, trackingNumber);
  revalidatePath(`/orders/${orderId}`);
  redirect(`/orders/${orderId}`);
}
