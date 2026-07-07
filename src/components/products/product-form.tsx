'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProductAction, updateProductAction } from '@/server/actions/products';
import type { Category, Product } from '@prisma/client';

interface ProductFormProps {
  initialValues?: Partial<Product> & { categoryId?: string | null };
  productId?: string;
  categories: Category[];
}

export function ProductForm({ initialValues, productId, categories }: ProductFormProps) {
  const router = useRouter();

  return (
    <form
      action={productId ? updateProductAction.bind(null, productId) : createProductAction}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" defaultValue={initialValues?.name ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId ?? ''} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (DZD)</Label>
          <Input id="price" name="price" type="number" min="0" defaultValue={initialValues?.price ?? 0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Cost (DZD)</Label>
          <Input id="cost" name="cost" type="number" min="0" defaultValue={initialValues?.cost ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={initialValues?.sku ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" name="barcode" defaultValue={initialValues?.barcode ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock quantity</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={initialValues?.stock ?? 0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initialValues?.status ?? 'ACTIVE'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrls">Images</Label>
        <Input id="imageUrls" name="imageUrls" placeholder="Image upload support will be added later" disabled />
        <p className="text-xs text-slate-500">Image upload is wired as a placeholder for future storage integration.</p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">{productId ? 'Save changes' : 'Create product'}</Button>
        <Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
