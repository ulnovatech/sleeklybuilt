'use client';

import { RouteErrorBoundary } from '@/components/layout/route-boundaries';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorBoundary surface="Discovery plans" error={error} reset={reset} fallbackHref="/discovery" fallbackLabel="Discovery runs" />;
}
