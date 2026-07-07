'use client';

import Link from 'next/link';
import type { Category, Product } from '@prisma/client';

interface ProductTableProps {
  products: Array<Product & { category: Category | null }>;
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function ProductTable({ products, totalPages, currentPage, basePath }: ProductTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  {product.sku ? <div className="text-xs text-slate-500">SKU: {product.sku}</div> : null}
                </td>
                <td className="px-4 py-3">{product.category?.name ?? 'Uncategorized'}</td>
                <td className="px-4 py-3">{product.price} DZD</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  {product.status === 'ACTIVE' ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`${basePath}/${product.id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                      View
                    </Link>
                    <Link href={`${basePath}/${product.id}/edit`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</div>
          <div className="flex gap-2">
            <Link href={`${basePath}?page=${Math.max(1, currentPage - 1)}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
              Previous
            </Link>
            <Link href={`${basePath}?page=${Math.min(totalPages, currentPage + 1)}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
              Next
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
