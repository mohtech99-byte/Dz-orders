import { PageHeader } from '@/components/shared/page-header';
import { CustomerForm } from '@/components/customers/customer-form';

export const dynamic = 'force-dynamic';
import { getCustomer, getReferenceData } from '@/server/services/customers';
import { notFound } from 'next/navigation';

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const [customer, { wilayas, communes }] = await Promise.all([getCustomer(params.id), getReferenceData()]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit customer" description="Update the selected customer profile." />
      <CustomerForm initialValues={customer} customerId={customer.id} wilayas={wilayas} communes={communes} />
    </div>
  );
}
