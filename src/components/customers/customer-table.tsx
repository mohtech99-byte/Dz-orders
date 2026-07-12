import Link from 'next/link';
import { Eye, Pencil, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import type { Customer, Commune, Wilaya } from '@prisma/client';

interface CustomerTableProps {
  customers: Array<Customer & { wilaya: Wilaya; commune: Commune }>;
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function CustomerTable({ customers, totalPages, currentPage, basePath }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="Customers are created automatically from orders, or you can add one manually."
      />
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/${customer.id}`} className="font-medium text-foreground hover:text-primary">
                      {customer.fullName}
                    </Link>
                    <div className="max-w-xs truncate text-xs text-muted-foreground">{customer.address}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-data text-foreground">{customer.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {customer.wilaya.nameFr} / {customer.commune.nameFr}
                  </td>
                  <td className="px-4 py-3">
                    {customer.isBlacklisted ? (
                      <Badge tone="danger" dot>
                        Blacklisted
                      </Badge>
                    ) : (
                      <Badge tone="success" dot>
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`${basePath}/${customer.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="View customer"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`${basePath}/${customer.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="Edit customer"
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
