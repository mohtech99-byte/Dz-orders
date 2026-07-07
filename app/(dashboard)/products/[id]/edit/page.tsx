import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { ProductForm } from '@/components/products/product-form';
import { getProduct, listCategories } from '@/server/services/products';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([getProduct(params.id), listCategories()]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit product" description="Update the selected product details." />
      <ProductForm initialValues={product} productId={product.id} categories={categories} />
    </div>
  );
}
