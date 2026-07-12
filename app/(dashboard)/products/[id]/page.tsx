import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { deleteProductAction } from '@/server/actions/products';
import { getProduct } from '@/server/services/products';

export const dynamic = 'force-dynamic';

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function stockBadge(stock: number) {
  if (stock <= 0) {
    return (
      <Badge tone="danger" dot>
        Out of stock
      </Badge>
    );
  }
  if (stock <= 10) {
    return (
      <Badge tone="warning" dot>
        Low · {stock}
      </Badge>
    );
  }
  return (
    <Badge tone="success" dot>
      {stock} in stock
    </Badge>
  );
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description="Product details and stock information."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/products/${product.id}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <form action={deleteProductAction.bind(null, product.id)}>
              <Button type="submit" variant="danger">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </form>
          </>
        }
      />

      <Card>
        <dl className="grid gap-4 md:grid-cols-2">
          <MetaItem label="Category" value={product.category?.name ?? 'Uncategorized'} />
          <MetaItem label="Price" value={<span className="tabular-nums">{product.price.toLocaleString()} DZD</span>} />
          <MetaItem label="Cost" value={product.cost ? <span className="tabular-nums">{product.cost.toLocaleString()} DZD</span> : '—'} />
          <MetaItem label="SKU" value={product.sku ? <span className="font-data">{product.sku}</span> : '—'} />
          <MetaItem label="Barcode" value={product.barcode ? <span className="font-data">{product.barcode}</span> : '—'} />
          <MetaItem label="Stock" value={stockBadge(product.stock)} />
          <MetaItem
            label="Status"
            value={
              <Badge tone={product.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
            }
          />
        </dl>
      </Card>
    </div>
  );
}
