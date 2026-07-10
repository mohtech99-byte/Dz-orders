'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { togglePublicOrderFormAction, updatePublicOrderFormSettingsAction, createPublicOrderFormAction } from '@/server/actions/public-order-form';

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
    <Button
      type="button"
      onClick={handleCopy}
      className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Public order form</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Get a shareable link customers can use to order directly from Facebook, Instagram, or TikTok — no account needed.
        </p>
        <form action={createPublicOrderFormAction} className="mt-4">
          <Button type="submit">Create public order form</Button>
        </form>
      </div>
    );
  }

  const publicPath = `/store/${form.slug}`;

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Public order form</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            form.isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {form.isActive ? 'Active' : 'Disabled'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={publicPath}
          className="h-10 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        />
        <CopyLinkButton slug={form.slug} />
      </div>

      <form action={togglePublicOrderFormAction.bind(null, form.id)}>
        <input type="hidden" name="isActive" value={String(form.isActive)} />
        <Button
          type="submit"
          className={
            form.isActive
              ? 'bg-rose-600 text-white hover:bg-rose-500'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }
        >
          {form.isActive ? 'Disable form' : 'Enable form'}
        </Button>
      </form>

      <form action={updatePublicOrderFormSettingsAction.bind(null, form.id)} className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Headline
          <input
            name="headline"
            defaultValue={form.fieldsConfig?.headline ?? ''}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Subheadline
          <input
            name="subheadline"
            defaultValue={form.fieldsConfig?.subheadline ?? ''}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Theme color
          <input
            type="color"
            name="themeColor"
            defaultValue={form.themeColor ?? '#0f172a'}
            className="h-10 w-16 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <Button type="submit">Save customization</Button>
      </form>
    </div>
  );
}
