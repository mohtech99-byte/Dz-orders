import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your store products." />
      <EmptyState title="No products yet" description="Add products to manage pricing and stock." />
    </div>
  );
}
