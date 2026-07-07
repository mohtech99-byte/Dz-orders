import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { OrderForm } from '@/components/orders/order-form';
import { getOrder, getOrderReferenceData } from '@/server/services/orders';

export const dynamic = 'force-dynamic';

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const [order, referenceData] = await Promise.all([getOrder(params.id), getOrderReferenceData()]);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit order" description="Update the selected order details." />
      <OrderForm
        initialValues={order}
        orderId={order.id}
        customers={referenceData.customers}
        products={referenceData.products}
        wilayas={referenceData.wilayas}
        communes={referenceData.communes}
        deliveryCompanies={referenceData.deliveryCompanies}
      />
    </div>
  );
}
