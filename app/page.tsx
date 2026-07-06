import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-8">
      <PageHeader title="Welcome to DZ Orders" description="Launch your first Algerian merchant store." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h2 className="text-xl font-semibold">Multi-tenant SaaS</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">One platform for thousands of independent stores.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Built for Algeria</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Wilaya/commune data, delivery pricing, COD workflows.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Phase 0 ready</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Auth, dashboard shell, Prisma, seed data and app foundation.</p>
        </Card>
      </div>
    </main>
  );
}
