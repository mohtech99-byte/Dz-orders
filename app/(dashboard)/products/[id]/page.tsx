import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { deleteProductAction } from '@/server/actions/products';
import { getProduct } from '@/server/services/products';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={product.name} description="Product details and stock information." />
        <div className="flex gap-2">
          <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            <Link href={`/products/${product.id}/edit`}>Edit</Link>
          </Button>
          <form action={deleteProductAction.bind(null, product.id)}>
            <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-500">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Category</dt>
            <dd className="mt-1 text-sm">{product.category?.name ?? 'Uncategorized'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Price</dt>
            <dd className="mt-1 text-sm">{product.price} DZD</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Cost</dt>
            <dd className="mt-1 text-sm">{product.cost ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">SKU</dt>
            <dd className="mt-1 text-sm">{product.sku ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Barcode</dt>
            <dd className="mt-1 text-sm">{product.barcode ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Stock</dt>
            <dd className="mt-1 text-sm">{product.stock}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-1 text-sm">{product.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
