'use client';

import Link from 'next/link';
import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DemandCapturePanel } from '@/components/demand/demand-capture-panel';
import { DemandInboxPanel } from '@/components/demand/demand-inbox-panel';
import { PageHeader } from '@/components/layout/page-header';
import { Button, Skeleton } from '@/components/ui/primitives';
import { PAGE_COPY } from '@/lib/product-copy';
import { cn } from '@/lib/utils';

type DemandTab = 'inbox' | 'capture';

export default function DemandPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <DemandPageContent />
    </Suspense>
  );
}

function DemandPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get('tab') === 'capture' ? 'capture' : 'inbox') as DemandTab;
  const [inboxKey, setInboxKey] = useState(0);

  const setTab = useCallback(
    (next: DemandTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === 'inbox') params.delete('tab');
      else params.set('tab', next);
      const query = params.toString();
      router.replace(query ? `/intent?${query}` : '/intent', { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader compact title={PAGE_COPY.demandInbox.title} description={PAGE_COPY.demandInbox.description} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" asChild>
            <Link href="/review?kind=demand">Open in Queue</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/intent?tab=capture">Capture demand</Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-line">
        {(
          [
            { id: 'inbox', label: 'Inbox' },
            { id: 'capture', label: 'Capture' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
              tab === item.id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'inbox' ? (
        <DemandInboxPanel key={inboxKey} />
      ) : (
        <DemandCapturePanel
          onCreated={() => {
            setInboxKey((value) => value + 1);
            setTab('inbox');
          }}
        />
      )}
    </div>
  );
}
