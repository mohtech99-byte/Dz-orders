'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Customer, Commune, Wilaya } from '@prisma/client';

interface CustomerTableProps {
  customers: Array<Customer & { wilaya: Wilaya; commune: Commune }>;
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function CustomerTable({ customers, totalPages, currentPage, basePath }: CustomerTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{customer.fullName}</div>
                  <div className="text-xs text-slate-500">{customer.address}</div>
                </td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">{customer.wilaya.nameFr} / {customer.commune.nameFr}</td>
                <td className="px-4 py-3">
                  {customer.isBlacklisted ? <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">Blacklisted</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Active</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`${basePath}/${customer.id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                      View
                    </Link>
                    <Link href={`${basePath}/${customer.id}/edit`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
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
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Link href={`${basePath}?page=${Math.max(1, currentPage - 1)}`}>Previous</Link>
            </Button>
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Link href={`${basePath}?page=${Math.min(totalPages, currentPage + 1)}`}>Next</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
