'use client';

import { RouteErrorBoundary } from '@/components/layout/route-boundaries';

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorBoundary surface="Outreach" error={error} reset={reset} />;
}
