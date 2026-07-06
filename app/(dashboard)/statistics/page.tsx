import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Statistics" description="See your sales pulse." />
      <EmptyState title="No statistics yet" description="Statistics will appear once order data is available." />
    </div>
  );
}
