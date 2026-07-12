'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateOrganizationOriginAction } from '@/server/actions/delivery';
import type { Commune, Wilaya } from '@prisma/client';

interface OriginSettingsProps {
  wilayas: Wilaya[];
  communes: Commune[];
  currentWilayaId: number | null;
  currentCommuneId: number | null;
}

export function OriginSettings({ wilayas, communes, currentWilayaId, currentCommuneId }: OriginSettingsProps) {
  const [wilayaId, setWilayaId] = useState(currentWilayaId ? String(currentWilayaId) : '');

  const filteredCommunes = useMemo(() => communes.filter((commune) => String(commune.wilayaId) === wilayaId), [communes, wilayaId]);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ship-from location</h3>
        <p className="mt-1 text-sm text-muted-foreground">Required by delivery companies to calculate routes and pricing.</p>
      </div>

      <form action={updateOrganizationOriginAction} className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Wilaya
          <select
            name="wilayaId"
            required
            value={wilayaId}
            onChange={(event) => setWilayaId(event.target.value)}
            className="flex h-10 w-48 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Select wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.nameFr}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Commune
          <select
            name="communeId"
            required
            disabled={!wilayaId}
            defaultValue={currentCommuneId ?? ''}
            className="flex h-10 w-48 rounded-lg border border-border bg-surface px-3 text-sm text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Select commune</option>
            {filteredCommunes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {commune.nameFr}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
