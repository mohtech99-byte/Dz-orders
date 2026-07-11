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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Ship-from location</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Required by delivery companies to calculate routes and pricing.</p>
      </div>

      <form action={updateOrganizationOriginAction} className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Wilaya
          <select
            name="wilayaId"
            required
            value={wilayaId}
            onChange={(event) => setWilayaId(event.target.value)}
            className="flex h-10 w-48 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">Select wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.nameFr}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Commune
          <select
            name="communeId"
            required
            disabled={!wilayaId}
            defaultValue={currentCommuneId ?? ''}
            className="flex h-10 w-48 rounded-md border border-slate-200 bg-white px-3 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
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
