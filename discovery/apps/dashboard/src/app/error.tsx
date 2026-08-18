'use client';

import { ErrorState } from '@/components/ui/primitives';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
      <ErrorState
        title="This workspace could not be opened"
        description={error.message || 'An unexpected error interrupted this operation. Your existing work was not changed.'}
        onRetry={reset}
        className="w-full"
      />
    </div>
  );
}
