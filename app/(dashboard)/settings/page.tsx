import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Update your store details." />
      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-400">Settings will be available after setup.</p>
      </Card>
    </div>
  );
}
