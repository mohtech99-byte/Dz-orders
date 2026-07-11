'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { customerSchema } from '@/lib/validations/customers';
import { createCustomer, deleteCustomer, toggleCustomerBlacklist, updateCustomer } from '@/server/services/customers';

export type CustomerFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

function parseCustomerInput(formData: FormData) {
  return {
    fullName: formData.get('fullName')?.toString() ?? '',
    phone: formData.get('phone')?.toString() ?? '',
    altPhone: formData.get('altPhone')?.toString() ?? '',
    wilayaId: formData.get('wilayaId')?.toString() ?? '',
    communeId: formData.get('communeId')?.toString() ?? '',
    address: formData.get('address')?.toString() ?? '',
    notes: formData.get('notes')?.toString() ?? '',
    isBlacklisted: formData.get('isBlacklisted') === 'on'
  };
}

export async function createCustomerAction(formData: FormData): Promise<CustomerFormState> {
  const input = parseCustomerInput(formData);
  const parsed = customerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await createCustomer(parsed.data);
  } catch {
    return {
      error: 'Unable to create the customer right now.'
    };
  }

  revalidatePath('/customers');
  redirect('/customers');
}

export async function updateCustomerAction(id: string, formData: FormData): Promise<CustomerFormState> {
  const input = parseCustomerInput(formData);
  const parsed = customerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await updateCustomer(id, parsed.data);
  } catch {
    return {
      error: 'Unable to update the customer right now.'
    };
  }

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomerAction(id: string) {
  await deleteCustomer(id);
  revalidatePath('/customers');
  redirect('/customers');
}

export async function toggleCustomerBlacklistAction(id: string, formData: FormData) {
  const isCurrentlyBlacklisted = formData.get('isBlacklisted') === 'true';
  const reason = formData.get('reason')?.toString();

  await toggleCustomerBlacklist(id, { blacklisted: !isCurrentlyBlacklisted, reason });

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}
