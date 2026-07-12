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
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Delivery companies</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect a company&apos;s API to create shipments automatically. Companies without an integration yet still work —
          you&apos;ll enter their tracking number manually after booking with them.
        </p>
      </div>

      <div className="divide-y divide-border">
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
        <span className="text-sm font-medium text-foreground">{company.name}</span>
        <span className="text-xs text-muted-foreground">Manual tracking only</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{company.name}</span>
        {credential?.lastTestedAt ? (
          credential.lastTestOk ? (
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-danger">
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
          className="h-9 w-40 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <input
          value={apiToken}
          onChange={(event) => setApiToken(event.target.value)}
          type="password"
          placeholder="API Token"
          className="h-9 w-48 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          <Button type="submit" variant="secondary" size="sm" className="h-9">
            Save
          </Button>
        </form>
        <Button
          type="button"
          disabled={isPending || !credential?.apiId}
          onClick={() => startTransition(() => testDeliveryCredentialAction(company.id))}
          variant="secondary"
          size="sm"
          className="h-9"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test connection'}
        </Button>
      </div>
    </div>
  );
}
