import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage your store orders." />
      <EmptyState title="No orders yet" description="Your orders will appear here once created." />
    </div>
  );
}
