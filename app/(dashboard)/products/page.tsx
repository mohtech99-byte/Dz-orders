import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ProductTable } from '@/components/products/product-table';
import { listProducts, listCategories } from '@/server/services/products';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: {
    search?: string;
    status?: string;
    category?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = Number(searchParams.page ?? 1);
  const [data, categories] = await Promise.all([
    listProducts({
      search: searchParams.search,
      status: searchParams.status,
      categoryId: searchParams.category,
      page,
      pageSize: 10
    }),
    listCategories()
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your tenant product catalog."
        actions={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4" /> Create product
            </Link>
          </Button>
        }
      />

      <form className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card md:flex-row" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="search"
            defaultValue={searchParams.search ?? ''}
            placeholder="Search by name, SKU, or barcode"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          name="category"
          defaultValue={searchParams.category ?? ''}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>

      <ProductTable products={data.items} totalPages={data.totalPages} currentPage={data.page} basePath="/products" />
    </div>
  );
}
