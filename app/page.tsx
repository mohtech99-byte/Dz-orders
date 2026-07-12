import Link from 'next/link';
import { ArrowRight, Store, MapPin, LayoutDashboard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: Store, title: 'Multi-tenant SaaS', description: 'One platform for thousands of independent stores.' },
  { icon: MapPin, title: 'Built for Algeria', description: 'Wilaya/commune data, delivery pricing, COD workflows.' },
  { icon: LayoutDashboard, title: 'Full order lifecycle', description: 'Confirmation calls, delivery tracking, and analytics in one place.' }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome to DZ Orders</h1>
        <p className="mt-3 text-base text-muted-foreground">Launch your first Algerian merchant store.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">
              Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} interactive>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
