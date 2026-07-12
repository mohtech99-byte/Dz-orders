import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function Pagination({ totalPages, currentPage, basePath }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // `disabled` has no effect on an <a>/Link (no CSS :disabled support on
  // anchors), so at the boundaries we render a real non-interactive element
  // instead of a Button-wrapped Link that would still be clickable.
  const disabledClasses =
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground opacity-50';

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{currentPage}</span> of {totalPages}
      </p>
      <div className="flex gap-2">
        {isFirstPage ? (
          <span className={disabledClasses} aria-disabled="true">
            <ChevronLeft className="h-4 w-4" /> Previous
          </span>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath}?page=${currentPage - 1}`}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
          </Button>
        )}

        {isLastPage ? (
          <span className={disabledClasses} aria-disabled="true">
            Next <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath}?page=${currentPage + 1}`}>
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
