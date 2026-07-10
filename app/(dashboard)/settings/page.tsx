import { PageHeader } from '@/components/shared/page-header';
import { PublicFormSettings } from '@/components/settings/public-form-settings';
import { getOwnPublicOrderForm } from '@/server/services/public-order-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const form = await getOwnPublicOrderForm();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Update your store details." />
      <PublicFormSettings
        form={
          form
            ? {
                id: form.id,
                slug: form.slug,
                isActive: form.isActive,
                themeColor: form.themeColor,
                fieldsConfig: form.fieldsConfig as { headline?: string; subheadline?: string } | null
              }
            : null
        }
      />
    </div>
  );
}
