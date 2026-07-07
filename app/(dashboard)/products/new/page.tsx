import { PageHeader } from '@/components/shared/page-header';
import { ProductForm } from '@/components/products/product-form';
import { listCategories } from '@/server/services/products';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <PageHeader title="Create product" description="Add a new product with pricing, SKU, and stock details." />
      <ProductForm categories={categories} />
    </div>
  );
}
