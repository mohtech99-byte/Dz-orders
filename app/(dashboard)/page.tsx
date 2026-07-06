import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your quick overview for today." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Track new and recent orders.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage your customer list and addresses.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">View inventory and pricing.</p>
        </Card>
      </div>
    </div>
  );
}
