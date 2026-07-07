import Link from 'next/link';
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Products" description="Manage your tenant product catalog." />
        <Button asChild>
          <Link href="/products/new">Create product</Link>
        </Button>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-950" method="get">
        <input
          name="search"
          defaultValue={searchParams.search ?? ''}
          placeholder="Search by name, SKU, or barcode"
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <select name="status" defaultValue={searchParams.status ?? ''} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select name="category" defaultValue={searchParams.category ?? ''} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button type="submit">Apply</Button>
      </form>

      {data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No products match your current filters.
        </div>
      ) : (
        <ProductTable products={data.items} totalPages={data.totalPages} currentPage={data.page} basePath="/products" />
      )}
    </div>
  );
}
