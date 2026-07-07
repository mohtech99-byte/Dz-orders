'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOrderAction, updateOrderAction } from '@/server/actions/orders';
import type { Commune, Customer, DeliveryCompany, Product, Wilaya, Order } from '@prisma/client';

interface OrderFormProps {
  initialValues?: Partial<Order> & { items?: Array<{ productId: string | null; quantity: number }> };
  orderId?: string;
  customers: Array<Customer & { wilaya: Wilaya; commune: Commune }>;
  products: Product[];
  wilayas: Wilaya[];
  communes: Commune[];
  deliveryCompanies: DeliveryCompany[];
}

export function OrderForm({ initialValues, orderId, customers, products, wilayas, communes, deliveryCompanies }: OrderFormProps) {
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialValues?.customerId ?? '');
  const [selectedWilaya, setSelectedWilaya] = useState(initialValues?.wilayaId?.toString() ?? '');
  const [selectedCommune, setSelectedCommune] = useState(initialValues?.communeId?.toString() ?? '');
  const [phoneSnapshot, setPhoneSnapshot] = useState(initialValues?.phoneSnapshot ?? '');
  const [addressSnapshot, setAddressSnapshot] = useState(initialValues?.addressSnapshot ?? '');
  const [deliveryCostValue, setDeliveryCostValue] = useState(initialValues?.deliveryCost ?? 0);
  const [discountValue, setDiscountValue] = useState(initialValues?.discount ?? 0);
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>(
    initialValues?.items?.length ? initialValues.items.map((item) => ({ productId: item.productId ?? '', quantity: item.quantity ?? 1 })) : [{ productId: '', quantity: 1 }]
  );

  const availableCommunes = communes.filter((commune) => commune.wilayaId === Number(selectedWilaya));

  const calculatedTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return sum + (product?.price ?? 0) * (item.quantity || 0);
    }, 0);

    return {
      subtotal,
      total: Math.max(0, subtotal + Number(deliveryCostValue || 0) - Number(discountValue || 0))
    };
  }, [deliveryCostValue, discountValue, items, products]);

  const updateItem = (index: number, partial: Partial<{ productId: string; quantity: number }>) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...partial } : item)));
  };

  const addItem = () => setItems((current) => [...current, { productId: '', quantity: 1 }]);
  const removeItem = (index: number) => setItems((current) => (current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current));

  const handleCustomerChange = (value: string) => {
    setSelectedCustomerId(value);
    const customer = customers.find((candidate) => candidate.id === value);
    if (customer) {
      setPhoneSnapshot(customer.phone ?? '');
      setSelectedWilaya(customer.wilayaId?.toString() ?? '');
      setSelectedCommune(customer.communeId?.toString() ?? '');
      setAddressSnapshot(customer.address ?? '');
    }
  };

  return (
    <form
      action={orderId ? ((formData: FormData) => {
        void updateOrderAction(orderId, formData);
      }) : ((formData: FormData) => {
        void createOrderAction(formData);
      })}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer</Label>
          <select
            id="customerId"
            name="customerId"
            value={selectedCustomerId}
            onChange={(event) => handleCustomerChange(event.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName} · {customer.phone}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Order source</Label>
          <select id="source" name="source" defaultValue={initialValues?.source ?? 'MANUAL'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="MANUAL">Manual</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="TIKTOK">TikTok</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PUBLIC_FORM">Public form</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneSnapshot">Phone</Label>
          <Input id="phoneSnapshot" name="phoneSnapshot" value={phoneSnapshot} onChange={(event) => setPhoneSnapshot(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wilayaId">Wilaya</Label>
          <select
            id="wilayaId"
            name="wilayaId"
            value={selectedWilaya}
            onChange={(event) => setSelectedWilaya(event.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            required
          >
            <option value="">Select a wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.nameFr}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="communeId">Commune</Label>
          <select id="communeId" name="communeId" value={selectedCommune} onChange={(event) => setSelectedCommune(event.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" required disabled={!selectedWilaya}>
            <option value="">Select a commune</option>
            {availableCommunes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {commune.nameFr}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressSnapshot">Address</Label>
          <Input id="addressSnapshot" name="addressSnapshot" value={addressSnapshot} onChange={(event) => setAddressSnapshot(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryCompanyId">Delivery company</Label>
          <select id="deliveryCompanyId" name="deliveryCompanyId" defaultValue={initialValues?.deliveryCompanyId ?? ''} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="">None</option>
            {deliveryCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryType">Delivery type</Label>
          <select id="deliveryType" name="deliveryType" defaultValue={initialValues?.deliveryType ?? 'HOME'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="HOME">Home delivery</option>
            <option value="STOP_DESK">Stop desk</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryCost">Delivery cost (DZD)</Label>
          <Input id="deliveryCost" name="deliveryCost" type="number" min="0" value={deliveryCostValue} onChange={(event) => setDeliveryCostValue(Number(event.target.value || 0))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (DZD)</Label>
          <Input id="discount" name="discount" type="number" min="0" value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value || 0))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment method</Label>
          <select id="paymentMethod" name="paymentMethod" defaultValue={initialValues?.paymentMethod ?? 'COD'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="COD">Cash on delivery</option>
            <option value="PREPAID">Prepaid</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initialValues?.status ?? 'NEW'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="NEW">New</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Products</Label>
          <Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={addItem}>
            Add product
          </Button>
        </div>
        {items.map((item, index) => {
          const selectedProduct = products.find((product) => product.id === item.productId);
          return (
            <div key={`${item.productId}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[2fr_1fr_auto] dark:border-slate-800">
              <div className="space-y-2">
                <Label htmlFor={`itemProductId-${index}`}>Product</Label>
                <select id={`itemProductId-${index}`} name="itemProductId" value={item.productId} onChange={(event) => updateItem(index, { productId: event.target.value, quantity: item.quantity })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" required>
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {product.price} DZD
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`itemQuantity-${index}`}>Quantity</Label>
                <Input id={`itemQuantity-${index}`} name="itemQuantity" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { productId: item.productId, quantity: Number(event.target.value || 1) })} required />
              </div>
              <div className="flex items-end">
                <Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              </div>
              {selectedProduct ? <p className="text-sm text-slate-500 md:col-span-2">{selectedProduct.name} · {selectedProduct.price} DZD each</p> : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea id="notes" name="notes" defaultValue={initialValues?.notes ?? ''} rows={4} className="flex min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{calculatedTotals.subtotal} DZD</span>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Total</span>
          <span className="font-semibold">{calculatedTotals.total} DZD</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">{orderId ? 'Save changes' : 'Create order'}</Button>
        <Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
