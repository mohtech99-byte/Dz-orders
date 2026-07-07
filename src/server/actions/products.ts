'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { productSchema } from '@/lib/validations/products';
import { createCategory, createProduct, deleteProduct, updateProduct } from '@/server/services/products';

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

function parseProductInput(formData: FormData) {
  return {
    name: formData.get('name')?.toString() ?? '',
    categoryId: formData.get('categoryId')?.toString() ?? '',
    price: formData.get('price')?.toString() ?? '0',
    cost: formData.get('cost')?.toString() ?? '',
    sku: formData.get('sku')?.toString() ?? '',
    barcode: formData.get('barcode')?.toString() ?? '',
    stock: formData.get('stock')?.toString() ?? '0',
    status: formData.get('status')?.toString() ?? 'ACTIVE',
    imageUrls: [] as string[]
  };
}

export async function createProductAction(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const input = parseProductInput(formData);
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await createProduct(parsed.data);
  } catch {
    return {
      error: 'Unable to create the product right now.'
    };
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function updateProductAction(id: string, _prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const input = parseProductInput(formData);
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await updateProduct(id, parsed.data);
  } catch {
    return {
      error: 'Unable to update the product right now.'
    };
  }

  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidatePath('/products');
  redirect('/products');
}

export async function createCategoryAction(name: string) {
  await createCategory(name);
  revalidatePath('/products');
}
