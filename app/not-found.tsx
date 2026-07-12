import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-24 text-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
