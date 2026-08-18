'use client';

import { RouteErrorBoundary } from '@/components/layout/route-boundaries';

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorBoundary
      surface="This pursuit"
      error={error}
      reset={reset}
      fallbackHref="/leads"
      fallbackLabel="Back to Pipeline"
    />
  );
}
