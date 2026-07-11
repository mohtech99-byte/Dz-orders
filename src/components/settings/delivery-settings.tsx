'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveDeliveryCredentialAction, testDeliveryCredentialAction } from '@/server/actions/delivery';

interface CompanyRow {
  company: { id: string; name: string; apiSupported: boolean };
  credential: { apiId: string | null; apiToken: string | null; lastTestedAt: Date | null; lastTestOk: boolean | null } | null;
  hasProvider: boolean;
}

export function DeliverySettings({ rows }: { rows: CompanyRow[] }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Delivery companies</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Connect a company&apos;s API to create shipments automatically. Companies without an integration yet still work —
          you&apos;ll enter their tracking number manually after booking with them.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row) => (
          <CompanyRow key={row.company.id} row={row} />
        ))}
      </div>
    </div>
  );
}

function CompanyRow({ row }: { row: CompanyRow }) {
  const { company, credential, hasProvider } = row;
  const [isPending, startTransition] = useTransition();
  const [apiId, setApiId] = useState(credential?.apiId ?? '');
  const [apiToken, setApiToken] = useState(credential?.apiToken ?? '');

  if (!hasProvider) {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{company.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Manual tracking only</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{company.name}</span>
        {credential?.lastTestedAt ? (
          credential.lastTestOk ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
              <XCircle className="h-3.5 w-3.5" /> Connection failed
            </span>
          )
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={apiId}
          onChange={(event) => setApiId(event.target.value)}
          placeholder="API ID"
          className="h-9 w-40 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <input
          value={apiToken}
          onChange={(event) => setApiToken(event.target.value)}
          type="password"
          placeholder="API Token"
          className="h-9 w-48 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <form
          action={(formData) => {
            startTransition(() => {
              saveDeliveryCredentialAction(company.id, formData);
            });
          }}
        >
          <input type="hidden" name="apiId" value={apiId} />
          <input type="hidden" name="apiToken" value={apiToken} />
          <Button
            type="submit"
            className="h-9 bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Save
          </Button>
        </form>
        <Button
          type="button"
          disabled={isPending || !credential?.apiId}
          onClick={() => startTransition(() => testDeliveryCredentialAction(company.id))}
          className="h-9 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test connection'}
        </Button>
      </div>
    </div>
  );
}
