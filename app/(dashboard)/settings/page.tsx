import { MapPin, Truck, Link2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { PublicFormSettings } from '@/components/settings/public-form-settings';
import { DeliverySettings } from '@/components/settings/delivery-settings';
import { OriginSettings } from '@/components/settings/origin-settings';
import { getOwnPublicOrderForm } from '@/server/services/public-order-form';
import { listDeliveryCompanyCredentials } from '@/server/services/delivery-credentials';
import { getOwnOrganization } from '@/server/services/organization';
import { getReferenceData } from '@/server/services/customers';

export const dynamic = 'force-dynamic';

function SectionLabel({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  const [form, deliveryRows, organization, { wilayas, communes }] = await Promise.all([
    getOwnPublicOrderForm(),
    listDeliveryCompanyCredentials(),
    getOwnOrganization(),
    getReferenceData()
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Update your store details." />

      <div className="space-y-3">
        <SectionLabel icon={MapPin}>Ship-from location</SectionLabel>
        <OriginSettings
          wilayas={wilayas}
          communes={communes}
          currentWilayaId={organization.wilayaId}
          currentCommuneId={organization.communeId}
        />
      </div>

      <div className="space-y-3">
        <SectionLabel icon={Truck}>Delivery</SectionLabel>
        <DeliverySettings rows={deliveryRows} />
      </div>

      <div className="space-y-3">
        <SectionLabel icon={Link2}>Public order form</SectionLabel>
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
    </div>
  );
}
