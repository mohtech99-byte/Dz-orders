import { CheckCircle2, AlertTriangle, Clock, PhoneCall, Store } from 'lucide-react';
import { PublicOrderForm } from '@/components/public-order/public-order-form';
import { getPublicOrderForm } from '@/server/services/public-order-form';

export const dynamic = 'force-dynamic';

interface StorePageProps {
  params: { slug: string };
  searchParams: { submitted?: string; duplicate?: string; error?: string };
}

function StatusScreen({
  icon: Icon,
  tone,
  title,
  description
}: {
  icon: typeof CheckCircle2;
  tone: 'success' | 'info' | 'danger';
  title: string;
  description: string;
}) {
  const toneClasses = {
    success: 'bg-success-bg text-success',
    info: 'bg-info-bg text-info',
    danger: 'bg-danger-bg text-danger'
  }[tone];

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${toneClasses}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          <PhoneCall className="h-4 w-4" />
          Keep your phone nearby — our team will call you shortly.
        </div>
      </div>
    </main>
  );
}

export default async function PublicStorePage({ params, searchParams }: StorePageProps) {
  const data = await getPublicOrderForm(params.slug);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-foreground">This order form isn&apos;t available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link may be inactive or no longer exists. Please contact the seller for an updated link.
          </p>
        </div>
      </main>
    );
  }

  if (searchParams.submitted) {
    return (
      <StatusScreen
        icon={CheckCircle2}
        tone="success"
        title="Order received!"
        description="Thank you — we've got your order. Our team will call you shortly to confirm the details before shipping."
      />
    );
  }

  if (searchParams.duplicate) {
    return (
      <StatusScreen
        icon={Clock}
        tone="info"
        title="We already have your order"
        description="You recently submitted an order with this phone number. No need to resubmit — our team will call you soon."
      />
    );
  }

  const { form, config, products, wilayas, communes } = data;

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{config.headline ?? form.organization.name}</h1>
          {config.subheadline ? <p className="mt-1 text-sm text-muted-foreground">{config.subheadline}</p> : null}
        </div>

        {searchParams.error ? (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-bg p-4 text-sm text-danger">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="mt-0.5 opacity-90">Please check your details and try again.</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">This store has no products available for order right now.</p>
          ) : (
            <PublicOrderForm formSlug={form.slug} products={products} wilayas={wilayas} communes={communes} themeColor={form.themeColor} />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">Powered by DZ Orders</p>
      </div>
    </main>
  );
}
