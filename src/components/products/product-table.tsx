import Link from 'next/link';
import { Eye, Pencil, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import type { Category, Product } from '@prisma/client';

interface ProductTableProps {
  products: Array<Product & { category: Category | null }>;
  totalPages: number;
  currentPage: number;
  basePath: string;
}

function StockBadge({ stock }: { stock: number }) {
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

export function ProductTable({ products, totalPages, currentPage, basePath }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState icon={ShoppingBag} title="No products yet" description="Add your first product to start building orders." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="sticky top-0 z-10 bg-surface-hover/80 backdrop-blur">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/${product.id}`} className="font-medium text-foreground hover:text-primary">
                      {product.name}
                    </Link>
                    {product.sku ? <div className="font-data text-xs text-muted-foreground">SKU: {product.sku}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">{product.price.toLocaleString()} DZD</td>
                  <td className="px-4 py-3">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={product.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                      {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`${basePath}/${product.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`${basePath}/${product.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} basePath={basePath} />
    </div>
  );
}
