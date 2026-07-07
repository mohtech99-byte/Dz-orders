'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCustomerAction, updateCustomerAction } from '@/server/actions/customers';
import type { Customer, Commune, Wilaya } from '@prisma/client';

interface CustomerFormProps {
  initialValues?: Partial<Customer> & { wilayaId?: number; communeId?: number };
  customerId?: string;
  wilayas: Wilaya[];
  communes: Commune[];
}

export function CustomerForm({ initialValues, customerId, wilayas, communes }: CustomerFormProps) {
  const router = useRouter();
  const [selectedWilaya, setSelectedWilaya] = useState(initialValues?.wilayaId?.toString() ?? '');

  const availableCommunes = communes.filter((commune) => commune.wilayaId === Number(selectedWilaya));

  return (
    <form
      action={customerId ? ((formData: FormData) => {
        void updateCustomerAction(customerId, formData);
      }) : ((formData: FormData) => {
        void createCustomerAction(formData);
      })}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={initialValues?.fullName ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={initialValues?.phone ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="altPhone">Alternative phone</Label>
          <Input id="altPhone" name="altPhone" defaultValue={initialValues?.altPhone ?? ''} />
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
          <select
            id="communeId"
            name="communeId"
            value={initialValues?.communeId?.toString() ?? ''}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            required
            disabled={!selectedWilaya}
          >
            <option value="">Select a commune</option>
            {availableCommunes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {commune.nameFr}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={initialValues?.address ?? ''} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={initialValues?.notes ?? ''}
          rows={4}
          className="flex min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
        <input type="checkbox" name="isBlacklisted" defaultChecked={Boolean(initialValues?.isBlacklisted)} />
        <span>Mark as blacklisted</span>
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit">{customerId ? 'Save changes' : 'Create customer'}</Button>
        <Button type="button" className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
