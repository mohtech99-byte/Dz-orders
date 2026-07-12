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
      action={productId ? ((formData: FormData) => {
        void updateProductAction(productId, formData);
      }) : ((formData: FormData) => {
        void createProductAction(formData);
      })}
      className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-card"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" defaultValue={initialValues?.name ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId ?? ''} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
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
          <select id="status" name="status" defaultValue={initialValues?.status ?? 'ACTIVE'} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrls">Images</Label>
        <Input id="imageUrls" name="imageUrls" placeholder="Image upload support will be added later" disabled />
        <p className="text-xs text-muted-foreground">Image upload is wired as a placeholder for future storage integration.</p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">{productId ? 'Save changes' : 'Create product'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
