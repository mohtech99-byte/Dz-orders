'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrder, deleteOrder, updateOrder, updateOrderStatus } from '@/server/services/orders';
import { orderSchema } from '@/lib/validations/orders';

export type OrderFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

function parseOrderInput(formData: FormData) {
  const itemProductIds = formData.getAll('itemProductId').map((value) => value.toString());
  const itemQuantities = formData.getAll('itemQuantity').map((value) => value.toString());
  const items = itemProductIds
    .map((productId, index) => ({
      productId,
      quantity: Number(itemQuantities[index] ?? '1')
    }))
    .filter((item) => item.productId);

  return {
    customerId: formData.get('customerId')?.toString() ?? '',
    phoneSnapshot: formData.get('phoneSnapshot')?.toString() ?? '',
    wilayaId: formData.get('wilayaId')?.toString() ?? '',
    communeId: formData.get('communeId')?.toString() ?? '',
    addressSnapshot: formData.get('addressSnapshot')?.toString() ?? '',
    deliveryCompanyId: formData.get('deliveryCompanyId')?.toString() ?? '',
    deliveryType: formData.get('deliveryType')?.toString() ?? 'HOME',
    deliveryCost: formData.get('deliveryCost')?.toString() ?? '0',
    discount: formData.get('discount')?.toString() ?? '0',
    paymentMethod: formData.get('paymentMethod')?.toString() ?? 'COD',
    notes: formData.get('notes')?.toString() ?? '',
    status: formData.get('status')?.toString() ?? 'NEW',
    source: formData.get('source')?.toString() ?? 'MANUAL',
    items
  };
}

export async function createOrderAction(formData: FormData): Promise<OrderFormState> {
  const input = parseOrderInput(formData);
  const parsed = orderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await createOrder(parsed.data);
  } catch {
    return {
      error: 'Unable to create the order right now.'
    };
  }

  revalidatePath('/orders');
  redirect('/orders');
}

export async function updateOrderAction(id: string, formData: FormData): Promise<OrderFormState> {
  const input = parseOrderInput(formData);
  const parsed = orderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await updateOrder(id, parsed.data);
  } catch {
    return {
      error: 'Unable to update the order right now.'
    };
  }

  revalidatePath('/orders');
  revalidatePath(`/orders/${id}`);
  redirect(`/orders/${id}`);
}

export async function deleteOrderAction(id: string) {
  await deleteOrder(id);
  revalidatePath('/orders');
  redirect('/orders');
}

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const status = formData.get('status')?.toString() ?? 'NEW';
  const note = formData.get('note')?.toString() ?? '';
  await updateOrderStatus(id, status, note);
  revalidatePath('/orders');
  revalidatePath(`/orders/${id}`);
  redirect(`/orders/${id}`);
}
