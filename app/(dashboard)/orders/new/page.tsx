import { PageHeader } from '@/components/shared/page-header';
import { OrderForm } from '@/components/orders/order-form';
import { getOrderReferenceData } from '@/server/services/orders';

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
  const { customers, products, wilayas, communes, deliveryCompanies } = await getOrderReferenceData();

  return (
    <div className="space-y-6">
      <PageHeader title="Create order" description="Capture a new order with customer, products, delivery, and payment details." />
      <OrderForm customers={customers} products={products} wilayas={wilayas} communes={communes} deliveryCompanies={deliveryCompanies} />
    </div>
  );
}
