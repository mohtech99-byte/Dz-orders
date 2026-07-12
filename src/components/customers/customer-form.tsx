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
  const [selectedCommune, setSelectedCommune] = useState(initialValues?.communeId?.toString() ?? '');

  const availableCommunes = communes.filter((commune) => commune.wilayaId === Number(selectedWilaya));

  const handleWilayaChange = (value: string) => {
    setSelectedWilaya(value);
    // Reset the commune whenever the wilaya changes so a stale, no-longer-valid
    // commune from a different wilaya can't linger in the selection.
    setSelectedCommune('');
  };

  return (
    <form
      action={customerId ? ((formData: FormData) => {
        void updateCustomerAction(customerId, formData);
      }) : ((formData: FormData) => {
        void createCustomerAction(formData);
      })}
      className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-card"
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
            onChange={(event) => handleWilayaChange(event.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            value={selectedCommune}
            onChange={(event) => setSelectedCommune(event.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          className="flex min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
        <input type="checkbox" name="isBlacklisted" defaultChecked={Boolean(initialValues?.isBlacklisted)} />
        <span>Mark as blacklisted</span>
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit">{customerId ? 'Save changes' : 'Create customer'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
