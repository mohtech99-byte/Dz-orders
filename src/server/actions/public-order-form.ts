'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  getOrCreatePublicOrderForm,
  submitPublicOrder,
  togglePublicOrderForm,
  updatePublicOrderFormSettings
} from '@/server/services/public-order-form';

export async function submitPublicOrderAction(formSlug: string, formData: FormData) {
  const itemProductIds = formData.getAll('itemProductId').map((value) => value.toString());
  const itemQuantities = formData.getAll('itemQuantity').map((value) => value.toString());
  const items = itemProductIds
    .map((productId, index) => ({ productId, quantity: Number(itemQuantities[index] ?? '1') }))
    .filter((item) => item.productId);

  const input = {
    fullName: formData.get('fullName')?.toString() ?? '',
    phone: formData.get('phone')?.toString() ?? '',
    wilayaId: formData.get('wilayaId')?.toString() ?? '',
    communeId: formData.get('communeId')?.toString() ?? '',
    address: formData.get('address')?.toString() ?? '',
    notes: formData.get('notes')?.toString() ?? '',
    website: formData.get('website')?.toString() ?? '',
    items
  };

  const result = await submitPublicOrder(formSlug, input);

  if (result.status === 'success') {
    redirect(`/store/${formSlug}?submitted=1`);
  }

  if (result.status === 'duplicate') {
    redirect(`/store/${formSlug}?duplicate=1`);
  }

  redirect(`/store/${formSlug}?error=1`);
}

export async function createPublicOrderFormAction() {
  await getOrCreatePublicOrderForm();
  revalidatePath('/settings');
}

export async function togglePublicOrderFormAction(formId: string, formData: FormData) {
  const isCurrentlyActive = formData.get('isActive') === 'true';
  await togglePublicOrderForm(formId, !isCurrentlyActive);
  revalidatePath('/settings');
}

export async function updatePublicOrderFormSettingsAction(formId: string, formData: FormData) {
  await updatePublicOrderFormSettings(formId, {
    headline: formData.get('headline')?.toString(),
    subheadline: formData.get('subheadline')?.toString(),
    themeColor: formData.get('themeColor')?.toString()
  });
  revalidatePath('/settings');
}
