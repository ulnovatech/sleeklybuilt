'use client';

import Link from 'next/link';
import { Button, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { useApiQuery } from '@/lib/use-api-query';
import { cn } from '@/lib/utils';

export type FactoryCohortResponse = {
  sellDate: string;
  harvestDate: string | null;
  status: 'missing' | 'purifying' | 'frozen' | 'failed';
  keeperCount: number;
  dumpsterCount: number;
  frozenAt: string | null;
  errorMessage: string | null;
  fallback: {
    id: string;
    sellDate: string;
    harvestDate: string;
    keeperCount: number;
  } | null;
  scoreboard?: {
    keepers: number;
    dumpster: number;
    pitched: number;
    unpitched: number;
    demandJumps: number;
    greenfieldPct: number | null;
    modernizeCount: number;
    dumpsterReasonPct: number | null;
    readyByFreeze: boolean;
  };
  yield?: Array<{
    city: string;
    industry: string;
    country: string;
    yieldScore: number;
    qualified: number | null;
    won: number;
    lost: number;
    headline: string;
  }>;
  demandOpen?: number;
};

export function PitchTodayYieldBanner({ sellDate }: { sellDate?: string }) {
  const path = sellDate ? `/api/factory/cohort?sellDate=${sellDate}` : '/api/factory/cohort';
  const { data } = useApiQuery<FactoryCohortResponse>(path, { intervalMs: 60_000 });
  const pitched = data?.scoreboard?.pitched ?? 0;
  const keepers = data?.scoreboard?.keepers ?? data?.keeperCount ?? 0;
  const unpitched = data?.scoreboard?.unpitched ?? Math.max(0, keepers - pitched);
  const winner = data?.yield?.[0];
  return (
    <p className="mt-1 text-sm text-ink-muted">
      {keepers > 0 ? `${pitched} recorded · ${unpitched} left` : 'No keepers frozen'}
      {winner ? ` · ${winner.headline}` : ''}.
    </p>
  );
}

function pitchTodayHref(sellDate?: string) {
  const params = new URLSearchParams({ pitchToday: '1', sort: 'rank', direction: 'asc', limit: '100' });
  if (sellDate) params.set('sellDate', sellDate);
  return `/leads?${params.toString()}`;
}

function dumpsterHref(sellDate?: string) {
  const params = new URLSearchParams({ dumpster: '1', sort: 'rankScore', direction: 'desc' });
  if (sellDate) params.set('sellDate', sellDate);
  return `/leads?${params.toString()}`;
}

function MetricTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-ink-faint">{hint}</p> : null}
    </>
  );
  if (!href) {
    return <div className="rounded-md border border-line bg-surface-raised p-3">{inner}</div>;
  }
  return (
    <Link
      href={href}
      className="rounded-md border border-line bg-surface-raised p-3 transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {inner}
    </Link>
  );
}

function YieldStrip({ rows }: { rows: NonNullable<FactoryCohortResponse['yield']> }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No city × type yield yet. Close a few Pitch today outcomes and rotation will overweight winners.
      </p>
    );
  }
  const winner = rows[0];
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink">{winner.headline}.</p>
      <ul className="space-y-1">
        {rows.slice(0, 3).map((row) => (
          <li key={`${row.country}-${row.city}-${row.industry}`} className="flex justify-between gap-3 text-xs">
            <span className="truncate text-ink-muted">
              {row.city} · {row.industry}
            </span>
            <span className="shrink-0 tabular-nums text-ink">
              yield {row.yieldScore.toFixed(0)}
              {row.won + row.lost > 0 ? ` · ${row.won}W/${row.lost}L` : ''}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/discovery/plans" className="text-xs font-medium text-accent hover:underline">
        Open plans
      </Link>
    </div>
  );
}

export function PitchTodayCard({ className }: { className?: string }) {
  const { data, error, isLoading, refresh } = useApiQuery<FactoryCohortResponse>('/api/factory/cohort', {
    intervalMs: 60_000,
  });

  if (isLoading && !data) {
    return (
      <section className={cn('rounded-lg border border-line bg-surface p-4', className)} aria-busy="true">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-3 h-8 w-40" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <ErrorState
        className={cn('min-h-40', className)}
        title="Pitch today could not load"
        description="The frozen list status is unavailable. Do not pitch a mixed pipeline queue."
        onRetry={() => void refresh()}
      />
    );
  }

  const status = data?.status ?? 'missing';
  const keepers = data?.scoreboard?.keepers ?? data?.keeperCount ?? 0;
  const dumpster = data?.scoreboard?.dumpster ?? data?.dumpsterCount ?? 0;
  const pitched = data?.scoreboard?.pitched ?? 0;
  const unpitched = data?.scoreboard?.unpitched ?? keepers;
  const yieldRows = data?.yield ?? [];
  const demandOpen = data?.demandOpen ?? 0;
  const demandJumps = data?.scoreboard?.demandJumps ?? 0;
  const greenfieldPct = data?.scoreboard?.greenfieldPct;
  const modernizeCount = data?.scoreboard?.modernizeCount ?? 0;
  const ready = data?.scoreboard?.readyByFreeze ?? false;

  if (status === 'failed') {
    const fallbackHref = data?.fallback ? pitchTodayHref(data.fallback.sellDate) : null;
    return (
      <section
        className={cn('rounded-lg border border-danger/30 bg-danger-muted p-4', className)}
        role="alert"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-danger-foreground">Today scoreboard</h2>
          <StatusBadge tone="danger">Purify failed</StatusBadge>
        </div>
        <p className="mt-2 text-sm text-danger-foreground">
          {data?.errorMessage ?? 'Night purify did not freeze a list.'} Do not pitch a mixed queue.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {fallbackHref ? (
            <Button asChild variant="primary" className="h-11 min-h-11">
              <Link href={fallbackHref}>Open last good list ({data?.fallback?.keeperCount ?? 0})</Link>
            </Button>
          ) : (
            <p className="text-sm text-danger-foreground/80">No last-good cohort is on file.</p>
          )}
          <Button variant="ghost" className="h-11 min-h-11" onClick={() => void refresh()}>
            Retry status
          </Button>
        </div>
      </section>
    );
  }

  const scoreboardGrid = (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <MetricTile
        label="Keepers"
        value={keepers}
        hint={keepers === 0 ? 'Honest empty list' : 'Frozen morning list'}
        href={keepers > 0 ? pitchTodayHref(data?.sellDate) : undefined}
      />
      <MetricTile
        label="Dumpster"
        value={dumpster}
        hint="Recoverable remainder"
        href={dumpster > 0 ? dumpsterHref(data?.sellDate) : undefined}
      />
      <MetricTile
        label="Pitches recorded"
        value={pitched}
        hint={keepers > 0 ? `${unpitched} still unpitched` : 'Record from overlay'}
        href={keepers > 0 ? pitchTodayHref(data?.sellDate) : undefined}
      />
      <MetricTile
        label="Purify"
        value={status === 'frozen' ? (ready ? 'Ready' : 'Frozen') : status === 'purifying' ? 'Running' : 'Waiting'}
        hint={status === 'frozen' ? '07:00 EAT freeze' : 'List locks at 07:00 EAT'}
      />
    </div>
  );

  if (status === 'frozen' && keepers > 0) {
    return (
      <section className={cn('rounded-lg border border-line bg-surface p-4 shadow-panel', className)}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Today scoreboard</h2>
          <StatusBadge tone="success">Frozen</StatusBadge>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {unpitched} left on yesterday’s harvest
          {demandJumps > 0 ? ` · ${demandJumps} demand jump${demandJumps === 1 ? '' : 's'}` : ''}.
        </p>
        {scoreboardGrid}
        <p className="mt-3 text-xs text-ink-faint">
          Greenfield {greenfieldPct != null ? `${greenfieldPct}%` : '—'}
          {modernizeCount > 0 ? ` · ${modernizeCount} modernize leak` : ' · no modernize on the 100'}
          {data?.scoreboard?.dumpsterReasonPct != null
            ? ` · dumpster reasons ${data.scoreboard.dumpsterReasonPct}%`
            : ''}
          .
        </p>
        <div className="mt-4 rounded-md border border-line bg-surface-raised p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            This city type works
          </p>
          <div className="mt-2">
            <YieldStrip rows={yieldRows} />
          </div>
        </div>
        {demandOpen > 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            {demandOpen} hot demand signal{demandOpen === 1 ? '' : 's'} can jump Pitch today if they are
            phone-ready greenfield — they will not mix today’s dirty harvest into the 100.{' '}
            <Link href="/intent" className="font-medium text-accent hover:underline">
              Open Demand
            </Link>
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="primary" className="h-11 min-h-11 w-full sm:w-auto">
            <Link href={pitchTodayHref(data?.sellDate)}>Open Pitch today</Link>
          </Button>
          {dumpster > 0 ? (
            <Button asChild variant="secondary" className="h-11 min-h-11 w-full sm:w-auto">
              <Link href={dumpsterHref(data?.sellDate)}>View dumpster ({dumpster})</Link>
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  if (status === 'frozen' && keepers === 0) {
    return (
      <section className={cn('rounded-lg border border-line bg-surface p-4', className)}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Today scoreboard</h2>
          <StatusBadge tone="warning">Empty freeze</StatusBadge>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Yesterday’s harvest produced 0 phone-ready keepers. This is an honest empty list, not a mixed
          queue.
        </p>
        {scoreboardGrid}
        <div className="mt-4 rounded-md border border-line bg-surface-raised p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            This city type works
          </p>
          <div className="mt-2">
            <YieldStrip rows={yieldRows} />
          </div>
        </div>
        {dumpster > 0 ? (
          <div className="mt-4">
            <Button asChild variant="primary" className="h-11 min-h-11 w-full sm:w-auto">
              <Link href={dumpsterHref(data?.sellDate)}>View dumpster ({dumpster})</Link>
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className={cn('rounded-lg border border-line bg-surface p-4', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Today scoreboard</h2>
        <StatusBadge tone="neutral">{status === 'purifying' ? 'Purifying' : 'Not frozen yet'}</StatusBadge>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Ready from yesterday’s harvest — the list freezes at 07:00 EAT. Daytime discovery feeds tomorrow.
      </p>
      {scoreboardGrid}
      <div className="mt-4 rounded-md border border-line bg-surface-raised p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          This city type works
        </p>
        <div className="mt-2">
          <YieldStrip rows={yieldRows} />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        Harvest runs until 22:00 EAT. Do not start from an unfiltered Pipeline queue.
        {demandOpen > 0 ? ` ${demandOpen} demand signal${demandOpen === 1 ? '' : 's'} waiting — they jump after freeze.` : ''}
      </p>
    </section>
  );
}
