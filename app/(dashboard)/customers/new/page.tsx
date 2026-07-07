import { PageHeader } from '@/components/shared/page-header';
import { CustomerForm } from '@/components/customers/customer-form';

export const dynamic = 'force-dynamic';
import { getReferenceData } from '@/server/services/customers';

export default async function NewCustomerPage() {
  const { wilayas, communes } = await getReferenceData();

  return (
    <div className="space-y-6">
      <PageHeader title="Create customer" description="Add a new customer to your tenant directory." />
      <CustomerForm wilayas={wilayas} communes={communes} />
    </div>
  );
}
