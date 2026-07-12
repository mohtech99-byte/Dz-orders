'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  togglePublicOrderFormAction,
  updatePublicOrderFormSettingsAction,
  createPublicOrderFormAction
} from '@/server/actions/public-order-form';

interface PublicFormSettingsProps {
  form: {
    id: string;
    slug: string;
    isActive: boolean;
    themeColor: string | null;
    fieldsConfig: { headline?: string; subheadline?: string } | null;
  } | null;
}

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/store/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      {copied ? (
        <span className="flex items-center gap-1.5">
          <Check className="h-4 w-4" /> Copied
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <Copy className="h-4 w-4" /> Copy link
        </span>
      )}
    </Button>
  );
}

export function PublicFormSettings({ form }: PublicFormSettingsProps) {
  if (!form) {
    return (
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Public order form</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get a shareable link customers can use to order directly from Facebook, Instagram, or TikTok — no account needed.
        </p>
        <form action={createPublicOrderFormAction} className="mt-4">
          <Button type="submit">Create public order form</Button>
        </form>
      </Card>
    );
  }

  const publicPath = `/store/${form.slug}`;

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Public order form</h3>
        <Badge tone={form.isActive ? 'success' : 'neutral'} dot>
          {form.isActive ? 'Active' : 'Disabled'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={publicPath}
          className="h-10 flex-1 rounded-lg border border-border bg-surface-hover px-3 font-data text-sm text-muted-foreground"
        />
        <CopyLinkButton slug={form.slug} />
      </div>

      <form action={togglePublicOrderFormAction.bind(null, form.id)}>
        <input type="hidden" name="isActive" value={String(form.isActive)} />
        <Button type="submit" variant={form.isActive ? 'danger' : 'primary'}>
          {form.isActive ? 'Disable form' : 'Enable form'}
        </Button>
      </form>

      <form
        action={updatePublicOrderFormSettingsAction.bind(null, form.id)}
        className="space-y-3 border-t border-border pt-4"
      >
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Headline
          <input
            name="headline"
            defaultValue={form.fieldsConfig?.headline ?? ''}
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Subheadline
          <input
            name="subheadline"
            defaultValue={form.fieldsConfig?.subheadline ?? ''}
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Theme color
          <input
            type="color"
            name="themeColor"
            defaultValue={form.themeColor ?? '#0f766e'}
            className="h-10 w-16 rounded-lg border border-border bg-surface"
          />
        </label>
        <Button type="submit">Save customization</Button>
      </form>
    </Card>
  );
}
