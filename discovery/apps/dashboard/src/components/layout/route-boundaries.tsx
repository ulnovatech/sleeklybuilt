'use client';

import Link from 'next/link';
import { Button, ErrorState, Skeleton } from '@/components/ui/primitives';

/** Skeleton whose shape matches a toolbar + table/list surface. */
export function RouteListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-label="Loading workspace">
      <div className="border-b border-line pb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-2 rounded-lg border border-line bg-surface p-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton whose shape matches a record header + panel columns. */
export function RouteDetailSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading record">
      <div className="border-b border-line pb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-7 w-72" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

/**
 * Segment-level recovery surface. Names the failed workspace, keeps the operator
 * inside the console, and offers both retry and a safe route out.
 */
export function RouteErrorBoundary({
  surface,
  error,
  reset,
  fallbackHref = '/ops',
  fallbackLabel = 'Go to Today',
}: {
  surface: string;
  error: Error & { digest?: string };
  reset: () => void;
  fallbackHref?: string;
  fallbackLabel?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4">
      <ErrorState
        className="w-full"
        title={`${surface} could not be loaded`}
        description={
          error.message ||
          'An unexpected error interrupted this operation. No records were changed — retry, or move to another workspace.'
        }
        onRetry={reset}
      />
      <Button size="sm" variant="ghost" asChild>
        <Link href={fallbackHref}>{fallbackLabel}</Link>
      </Button>
    </div>
  );
}
