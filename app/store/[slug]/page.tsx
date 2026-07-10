import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { PublicOrderForm } from '@/components/public-order/public-order-form';
import { getPublicOrderForm } from '@/server/services/public-order-form';

export const dynamic = 'force-dynamic';

interface StorePageProps {
  params: { slug: string };
  searchParams: { submitted?: string; duplicate?: string; error?: string };
}

export default async function PublicStorePage({ params, searchParams }: StorePageProps) {
  const data = await getPublicOrderForm(params.slug);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">This order form isn&apos;t available</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The link may be inactive or no longer exists. Please contact the seller for an updated link.
          </p>
        </div>
      </main>
    );
  }

  const { form, config, products, wilayas, communes } = data;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{config.headline ?? form.organization.name}</h1>
          {config.subheadline ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{config.subheadline}</p> : null}
        </div>

        {searchParams.submitted ? (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Order received!</p>
              <p className="mt-0.5 opacity-90">Our team will call you shortly to confirm your order.</p>
            </div>
          </div>
        ) : null}

        {searchParams.duplicate ? (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
            <Clock className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">We already have your order</p>
              <p className="mt-0.5 opacity-90">You recently submitted an order with this phone number. Our team will call you soon.</p>
            </div>
          </div>
        ) : null}

        {searchParams.error ? (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="mt-0.5 opacity-90">Please check your details and try again.</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {products.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">This store has no products available for order right now.</p>
          ) : (
            <PublicOrderForm formSlug={form.slug} products={products} wilayas={wilayas} communes={communes} themeColor={form.themeColor} />
          )}
        </div>
      </div>
    </main>
  );
}
