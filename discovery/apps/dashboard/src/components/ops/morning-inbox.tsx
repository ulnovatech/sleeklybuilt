'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

export type MorningInboxItem = {
  id: string;
  label: string;
  count: number;
  hint: string;
  href: string;
};

export type MorningInboxData = {
  since: string;
  items: MorningInboxItem[];
};

function toneFor(id: string, count: number): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (count <= 0) return 'neutral';
  if (id === 'failed_jobs') return 'danger';
  if (id === 'review_required' || id === 'new_qualified') return 'warning';
  if (id === 'plans_completed') return 'success';
  return 'info';
}

export function MorningInbox({
  inbox,
  className,
}: {
  inbox: MorningInboxData;
  className?: string;
}) {
  const actionable = inbox.items.filter((item) => item.count > 0);
  const sinceLabel = (() => {
    try {
      return new Date(inbox.since).toLocaleString();
    } catch {
      return inbox.since;
    }
  })();

  return (
    <section className={cn('rounded-lg border border-line bg-surface p-4', className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">While you were away</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Overnight plans and triage signals since {sinceLabel}
          </p>
        </div>
        {actionable.length === 0 ? (
          <StatusBadge tone="success">Caught up</StatusBadge>
        ) : (
          <StatusBadge tone="warning">
            {actionable.length} item{actionable.length === 1 ? '' : 's'} need attention
          </StatusBadge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {inbox.items.map((item) => {
          const active = item.count > 0;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'rounded-md border px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                active
                  ? 'border-line bg-surface-raised hover:border-brand-300 hover:bg-brand-50/40'
                  : 'border-line/70 bg-surface opacity-80 hover:opacity-100',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  {item.label}
                </p>
                <StatusBadge tone={toneFor(item.id, item.count)}>{item.count}</StatusBadge>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{item.count}</p>
              <p className="mt-1 text-xs text-ink-muted">{item.hint}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
