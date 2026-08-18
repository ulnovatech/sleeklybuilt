'use client';

import Link from 'next/link';
import { Fragment, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { isAllCities } from '@agency/geo';
import type { DiscoveryRunStats } from '@agency/discovery';
import { BoiBriefExpand } from '@/components/intelligence/boi-brief-expand';
import { BoiBriefSummaryChip } from '@/components/intelligence/boi-brief-summary-chip';
import { PlanEditorWizard } from '@/components/discovery/plan-editor-wizard';
import { RunProgress } from '@/components/discovery/run-progress';
import { RunYieldPanel } from '@/components/discovery/run-yield-panel';
import { PageHeader } from '@/components/layout/page-header';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { BOI_COPY } from '@/lib/product-copy';
import { api } from '@/lib/api';
import { useListView } from '@/lib/use-list-view';

type Signal = {
  id: string;
  signalType: string;
  signalClass?: string;
  signalStrength: number;
  source: string;
  title: string | null;
  snippet: string | null;
  sourceUrl: string | null;
};

type Business = {
  id: string;
  name: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  source: string;
  sourceUrl: string | null;
  googleMapsUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  score: number | null;
  signals: Signal[];
  analysis: { hasWebsite: boolean; httpsEnabled: boolean | null; mobileFriendly: boolean | null } | null;
};

type RunSummary = {
  city: string;
  country: string;
  industry: string;
  status: string;
  runProfile?: string;
  prospectFocus?: boolean;
  planId?: string | null;
  errorMessage?: string | null;
  stats?: DiscoveryRunStats | null;
};

type DiscoveryOptions = {
  countries: string[];
  industries: string[];
  citiesByCountry: Record<string, string[]>;
  allCitiesLabel: string;
  defaults: { country: string; city: string; industry: string };
};

function formatSource(source: string) {
  const labels: Record<string, string> = {
    google_maps: 'Google Maps',
    facebook: 'Facebook',
    instagram: 'Instagram',
    csv_import: 'CSV Import',
  };
  return labels[source] ?? source;
}

function formatLocation(city: string | null, country: string | null) {
  if (!city || isAllCities(city)) return country ?? '—';
  return `${city}, ${country}`;
}

function statusTone(status: string | undefined) {
  if (status === 'completed') return 'success' as const;
  if (status === 'failed') return 'danger' as const;
  if (status === 'running') return 'info' as const;
  return 'warning' as const;
}

function SignalPreview({ signals }: { signals: Signal[] }) {
  if (!signals?.length) {
    return <span className="text-xs text-ink-faint">—</span>;
  }
  return (
    <div className="space-y-1">
      {signals.slice(0, 2).map((s) => (
        <div key={s.id} className="rounded border border-line bg-surface-raised px-2 py-1 text-xs text-ink">
          <strong>{s.title ?? s.signalType}</strong> ({s.signalStrength})
          <span className="ml-1 text-ink-muted">· {s.signalClass === 'demand' ? 'demand' : 'enrichment'}</span>
          {s.snippet && <p className="mt-0.5 line-clamp-2 text-ink-muted">{s.snippet}</p>}
        </div>
      ))}
      {signals.length > 2 && (
        <p className="text-[11px] text-ink-faint">+{signals.length - 2} more signal{signals.length - 2 === 1 ? '' : 's'}</p>
      )}
    </div>
  );
}

function RunBusinessCard({
  business,
  pipelineRunning,
  expanded,
  onToggleBrief,
}: {
  business: Business;
  pipelineRunning: boolean;
  expanded: boolean;
  onToggleBrief: () => void;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{business.name}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{formatLocation(business.city, business.country)}</p>
        </div>
        {business.score != null ? (
          <span className="shrink-0 font-semibold tabular-nums text-ink">{business.score}</span>
        ) : null}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-ink-faint">Contact</dt>
          <dd className="text-ink-muted">{business.phone || business.email || '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Source</dt>
          <dd className="text-ink">{formatSource(business.source)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-ink-faint">Website</dt>
          <dd>
            {business.website ? (
              <a href={business.website} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">
                {business.website.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <StatusBadge tone="success">Greenfield</StatusBadge>
            )}
          </dd>
        </div>
      </dl>
      {business.signals?.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Signals</p>
          <SignalPreview signals={business.signals} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <BoiBriefSummaryChip businessId={business.id} onOpen={onToggleBrief} />
      </div>
      {expanded && (
        <div className="mt-3 border-t border-line pt-3">
          <BoiBriefExpand
            businessId={business.id}
            pipelineRunning={pipelineRunning}
            defaultOpen
            embedded
            onClose={onToggleBrief}
          />
        </div>
      )}
    </article>
  );
}

export default function DiscoveryDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DiscoveryDetailContent />
    </Suspense>
  );
}

function DiscoveryDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { state, update, toQueryString } = useListView({
    sort: 'name',
    direction: 'asc',
    limit: 25,
  });
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [total, setTotal] = useState(0);
  const [run, setRun] = useState<RunSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [expandedBoiId, setExpandedBoiId] = useState<string | null>(null);
  const [savePlanOpen, setSavePlanOpen] = useState(false);
  const [options, setOptions] = useState<DiscoveryOptions | null>(null);

  const pipelineRunning = run?.status === 'pending' || run?.status === 'running';

  const queryPath = useMemo(
    () => `/api/discovery/runs/${id}?${toQueryString()}`,
    [id, toQueryString],
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api<{
        run: RunSummary;
        businesses: Business[];
        items?: Business[];
        total?: number;
      }>(queryPath);
      setRun(data.run);
      const rows = data.items ?? data.businesses;
      setBusinesses(rows);
      setTotal(data.total ?? rows.length);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load this discovery run');
    } finally {
      setLoading(false);
    }
  }, [queryPath]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void api<DiscoveryOptions>('/api/discovery/options')
      .then(setOptions)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!pipelineRunning) return;
    const timer = setInterval(() => void load(), 3000);
    return () => clearInterval(timer);
  }, [load, pipelineRunning]);

  const retryFromFailedStage = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      await api(`/api/discovery/runs/${id}/retry`, { method: 'POST' });
      await load();
    } catch (e) {
      setRetryError(e instanceof Error ? e.message : 'Retry failed');
    } finally {
      setRetrying(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / state.limit));

  if (loading && !run) return <DetailSkeleton />;

  if (error && !run) {
    return (
      <ErrorState
        title="Discovery run unavailable"
        description={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div className="max-w-[1200px] space-y-4">
      <PageHeader
        compact
        title={run ? `${run.industry} — ${run.city}, ${run.country}` : 'Discovery run'}
        description="Raw discovery output — promote qualified prospects from the Queue."
      />

      <div className="-mt-2 flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge tone={statusTone(run?.status)}>{run?.status ?? 'unknown'}</StatusBadge>
        {run?.runProfile && <span className="text-ink-muted">Profile: {run.runProfile}</span>}
        {run?.prospectFocus && <StatusBadge tone="success">Prospect focus</StatusBadge>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" asChild>
          <Link href={`/review?runId=${id}&acquisitionLane=greenfield&kind=opportunity`}>
            Triage in Queue
          </Link>
        </Button>
        <Button size="sm" variant="secondary" asChild>
          <Link href="/discovery">All runs</Link>
        </Button>
        {run?.planId ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/discovery/plans/${run.planId}`}>Open plan</Link>
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setSavePlanOpen(true)}>
            Save as plan
          </Button>
        )}
      </div>

      {run && <RunProgress runId={id} runStatus={run.status} detailed />}

      {run?.stats && <RunYieldPanel stats={run.stats} />}

      {run?.status === 'failed' && (
        <div className="rounded-lg border border-danger/20 bg-danger-muted p-4 text-sm">
          <p className="font-medium text-danger-foreground">Pipeline failed</p>
          {run.errorMessage && <p className="mt-1 text-danger-foreground/90">{run.errorMessage}</p>}
          {retryError && <p className="mt-2 text-xs text-danger-foreground">{retryError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="danger" loading={retrying} onClick={() => void retryFromFailedStage()}>
              Retry from failed stage
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/discovery">Start new run</Link>
            </Button>
          </div>
        </div>
      )}

      {error && run && (
        <ErrorState title="Results refresh failed" description={error} onRetry={() => void load()} />
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-ink-muted">
          Search this run
          <Input
            value={draftQuery}
            placeholder="Business name, city…"
            onChange={(event) => setDraftQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') update({ q: draftQuery.trim(), resetPage: true });
            }}
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Sort
          <select
            className="h-9 w-full min-w-36 rounded-md border border-line bg-surface px-3 text-sm text-ink"
            value={state.sort}
            onChange={(event) => update({ sort: event.target.value, resetPage: true })}
          >
            <option value="name">Name</option>
            <option value="city">City</option>
            <option value="source">Source</option>
          </select>
        </label>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => update({ q: draftQuery.trim(), resetPage: true })}>
            Apply
          </Button>
          {(state.q || state.sort !== 'name') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraftQuery('');
                update({ q: '', sort: 'name', direction: 'asc', resetPage: true });
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {loading && businesses.length === 0 ? (
        <Skeleton className="h-72 w-full" />
      ) : businesses.length === 0 ? (
        <EmptyState
          title={state.q ? 'No businesses match this search' : 'No businesses in this run'}
          description={
            state.q
              ? 'Clear the search to see every business discovered in this run.'
              : pipelineRunning
                ? 'Discovery is still running. Results appear here as providers return candidates.'
                : 'This run produced no candidates. Try a different city, industry, or run profile.'
          }
          action={
            state.q ? (
              <Button
                size="sm"
                onClick={() => {
                  setDraftQuery('');
                  update({ q: '', resetPage: true });
                }}
              >
                Clear search
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/discovery">Back to runs</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {businesses.map((b) => (
              <RunBusinessCard
                key={b.id}
                business={b}
                pipelineRunning={pipelineRunning}
                expanded={expandedBoiId === b.id}
                onToggleBrief={() => setExpandedBoiId(expandedBoiId === b.id ? null : b.id)}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface shadow-panel md:block">
          <table className="w-full min-w-[1020px] text-sm">
            <thead className="bg-surface-raised text-left text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              <tr>
                <th className="p-3 font-semibold">Business</th>
                <th className="p-3 font-semibold">Contact</th>
                <th className="p-3 font-semibold">City</th>
                <th className="p-3 font-semibold">Source</th>
                <th className="p-3 font-semibold">Website</th>
                <th className="p-3 font-semibold">Reviews</th>
                <th className="p-3 font-semibold">Score</th>
                <th className="p-3 font-semibold">{BOI_COPY.opportunityBrief}</th>
                <th className="p-3 font-semibold">Intent signals</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <Fragment key={b.id}>
                  <tr className="border-t border-line align-top">
                    <td className="p-3 font-medium text-ink">{b.name}</td>
                    <td className="p-3 text-ink-muted">
                      {b.phone && <div>{b.phone}</div>}
                      {b.email && <div className="text-xs">{b.email}</div>}
                      {!b.phone && !b.email && '—'}
                    </td>
                    <td className="p-3 text-ink">{formatLocation(b.city, b.country)}</td>
                    <td className="p-3">
                      <span className="text-xs font-medium text-ink">{formatSource(b.source)}</span>
                      {(b.googleMapsUrl || b.sourceUrl) && (
                        <a
                          href={b.googleMapsUrl ?? b.sourceUrl ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs text-accent hover:underline"
                        >
                          View source
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      {b.website ? (
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-accent hover:underline"
                        >
                          {b.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <StatusBadge tone="success">Greenfield</StatusBadge>
                      )}
                    </td>
                    <td className="p-3 tabular-nums text-ink">
                      {b.rating != null ? `${b.rating} ★ (${b.reviewCount ?? 0})` : '—'}
                    </td>
                    <td className="p-3">
                      {b.score != null ? (
                        <span className="font-semibold tabular-nums text-ink">{b.score}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3">
                      <BoiBriefSummaryChip
                        businessId={b.id}
                        onOpen={() => setExpandedBoiId(expandedBoiId === b.id ? null : b.id)}
                      />
                    </td>
                    <td className="p-3">
                      <SignalPreview signals={b.signals ?? []} />
                    </td>
                  </tr>
                  {expandedBoiId === b.id && (
                    <tr className="border-t border-line bg-surface-raised">
                      <td colSpan={9} className="p-4">
                        <BoiBriefExpand
                          businessId={b.id}
                          pipelineRunning={pipelineRunning}
                          defaultOpen
                          embedded
                          onClose={() => setExpandedBoiId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
          <p>
            Showing {(state.page - 1) * state.limit + 1}–{Math.min(state.page * state.limit, total)} of{' '}
            {total} business{total === 1 ? '' : 'es'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={state.page <= 1}
              onClick={() => update({ page: state.page - 1 })}
            >
              Previous
            </Button>
            <span>
              Page {state.page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={state.page >= totalPages}
              onClick={() => update({ page: state.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <PlanEditorWizard
        open={savePlanOpen}
        onOpenChange={setSavePlanOpen}
        options={options}
        seed={
          run
            ? {
                name: `${run.city} ${run.industry}`.trim(),
                country: run.country,
                city: run.city,
                industry: run.industry,
                profile: (run.runProfile as 'micro' | 'standard' | 'boost' | undefined) ?? 'standard',
                prospectFocus: run.prospectFocus ?? true,
              }
            : null
        }
        onCreated={(planId) => {
          setSavePlanOpen(false);
          window.location.href = `/discovery/plans/${planId}`;
        }}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-[1200px] space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
