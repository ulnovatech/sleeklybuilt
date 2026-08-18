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
      surface="This discovery run"
      error={error}
      reset={reset}
      fallbackHref="/discovery"
      fallbackLabel="Back to discovery runs"
    />
  );
}
