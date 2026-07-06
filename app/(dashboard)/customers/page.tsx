import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer directory." />
      <EmptyState title="No customers yet" description="Add customers to see them listed here." />
    </div>
  );
}
