'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CsvImportPanel } from '@/components/discovery/csv-import-panel';
import { PlanEditorWizard } from '@/components/discovery/plan-editor-wizard';
import { RunTerminal } from '@/components/discovery/run-terminal';
import { PageHeader } from '@/components/layout/page-header';
import {
  SavedViewsControl,
  type ProductSavedView,
  type SavedView,
  type SavedViewDefinition,
} from '@/components/operator/saved-views-control';
import {
  Button,
  CollapsibleSection,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import { useListView } from '@/lib/use-list-view';

type Run = {
  id: string;
  country: string;
  city: string;
  industry: string;
  status: string;
  runProfile?: string;
  prospectFocus?: boolean;
  boiNarrative?: boolean;
  planId?: string | null;
  trigger?: string;
  startedAt: string | null;
  completedAt: string | null;
  stats?: {
    contactablePct?: number | null;
    accountsSaved?: number;
    candidatesDiscovered?: number;
    prospectCandidates?: number;
    highPotentialEstimate?: number;
  } | null;
};

type RunProfile = 'micro' | 'standard' | 'boost';

type DiscoveryOptions = {
  countries: string[];
  industries: string[];
  citiesByCountry: Record<string, string[]>;
  allCitiesLabel: string;
  defaults: { country: string; city: string; industry: string };
};

type BudgetProvider = {
  provider: string;
  cap: number;
  used: number;
  remaining: number;
  canSpend: boolean;
};

type SourceStatus = {
  name: string;
  label: string;
  configured: boolean;
  enabled?: boolean;
  reason?: string;
  health?: string;
};

const RUN_PRESETS: ProductSavedView[] = [
  {
    id: 'preset:recent',
    name: 'Recent runs',
    definition: { filters: {}, sort: 'createdAt', direction: 'desc', density: 'compact' },
  },
  {
    id: 'preset:plans',
    name: 'Plans',
    definition: {
      filters: { hasPlan: '1' },
      sort: 'createdAt',
      direction: 'desc',
      density: 'compact',
    },
  },
  {
    id: 'preset:failed',
    name: 'Needs attention (failed)',
    definition: { filters: { status: 'failed' }, sort: 'createdAt', direction: 'desc', density: 'compact' },
  },
  {
    id: 'preset:running',
    name: 'In progress',
    definition: { filters: { status: 'running' }, sort: 'createdAt', direction: 'desc', density: 'compact' },
  },
];

function formatLocation(city: string, country: string, allCitiesLabel: string) {
  if (city.trim().toLowerCase() === allCitiesLabel.trim().toLowerCase()) {
    return `All cities · ${country}`;
  }
  return `${city}, ${country}`;
}

function statusTone(status: string) {
  if (status === 'completed') return 'success' as const;
  if (status === 'failed') return 'danger' as const;
  if (status === 'running') return 'info' as const;
  return 'warning' as const;
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<DiscoverySkeleton />}>
      <DiscoveryPageContent />
    </Suspense>
  );
}

function DiscoveryPageContent() {
  const { state, update, clearFilters, toQueryString } = useListView({
    sort: 'createdAt',
    direction: 'desc',
    limit: 20,
  });
  const { push } = useToast();
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [runs, setRuns] = useState<Run[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [sourcesReady, setSourcesReady] = useState(false);
  const [options, setOptions] = useState<DiscoveryOptions | null>(null);
  const [budgetInfo, setBudgetInfo] = useState<{
    acquisitionMode: string;
    searchQueriesPerRun?: number;
    providers: BudgetProvider[];
  } | null>(null);
  const [form, setForm] = useState<{
    country: string;
    city: string;
    industry: string;
    profile: RunProfile;
    prospectFocus: boolean;
    boiNarrative: boolean;
  }>({
    country: '',
    city: '',
    industry: '',
    profile: 'standard',
    prospectFocus: false,
    boiNarrative: false,
  });
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [savePlanRun, setSavePlanRun] = useState<Run | null>(null);
  const [startOpen, setStartOpen] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const allCitiesLabel = options?.allCitiesLabel ?? 'All cities';
  const statusFilter = state.filters.status ?? '';
  const hasPlanFilter = state.filters.hasPlan ?? '';

  const cityOptions = useMemo(() => {
    if (!options) return [];
    const specific = options.citiesByCountry[form.country] ?? [];
    return [options.allCitiesLabel, ...specific];
  }, [options, form.country]);

  const queryPath = useMemo(
    () => `/api/discovery/runs?${toQueryString()}`,
    [toQueryString],
  );

  const load = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await api<{ items?: Run[]; runs: Run[]; total?: number }>(queryPath);
      setRuns(data.items ?? data.runs);
      setTotal(data.total ?? (data.items ?? data.runs).length);
    } catch (reason) {
      setListError(reason instanceof Error ? reason.message : 'Failed to load discovery runs');
    } finally {
      setListLoading(false);
    }
  }, [queryPath]);

  const loadSources = useCallback(
    () =>
      api<{
        sources: SourceStatus[];
        ready: boolean;
        message?: string;
        budget?: {
          acquisitionMode: string;
          searchQueriesPerRun?: number;
          providers: BudgetProvider[];
        };
      }>('/api/discovery/sources').then((d) => {
        setSources(d.sources);
        setSourcesReady(d.ready);
        if (d.budget) setBudgetInfo(d.budget);
        if (!d.ready && d.message) setError(d.message);
      }),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const hasActive = runs.some((r) => r.status === 'pending' || r.status === 'running');
    if (!hasActive) return;
    const id = setInterval(() => void load(), 3000);
    return () => clearInterval(id);
  }, [load, runs]);

  useEffect(() => {
    api<DiscoveryOptions>('/api/discovery/options')
      .then((opts) => {
        setOptions(opts);
        setForm((prev) => ({
          ...prev,
          country: opts.defaults.country,
          city: opts.defaults.city,
          industry: opts.defaults.industry,
        }));
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load discovery options'),
      );

    loadSources().catch((reason) =>
      setError(reason instanceof Error ? reason.message : 'Failed to load source status'),
    );
  }, [loadSources]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      setStartOpen(mq.matches);
      setSourcesOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const currentDefinition = useMemo<SavedViewDefinition>(
    () => ({
      filters: { ...state.filters, ...(state.q ? { q: state.q } : {}) },
      sort: state.sort,
      direction: state.direction,
      density: state.density,
    }),
    [state.density, state.direction, state.filters, state.q, state.sort],
  );

  const applySavedView = (view: SavedView) => {
    const nextFilters = { ...view.definition.filters };
    const q = nextFilters.q ?? '';
    delete nextFilters.q;
    setDraftQuery(q);
    update({
      q,
      sort: view.definition.sort ?? state.sort,
      direction: view.definition.direction ?? state.direction,
      density: view.definition.density ?? state.density,
      filters: nextFilters,
      page: 1,
    });
  };

  const setCountry = (country: string) => {
    const allLabel = options?.allCitiesLabel ?? 'All cities';
    setForm({ ...form, country, city: allLabel });
  };

  const wipeRuns = async () => {
    setWiping(true);
    setError(null);
    try {
      const result = await api<{ message: string }>('/api/discovery/runs/wipe', {
        method: 'DELETE',
      });
      setActiveRunId(null);
      setWipeOpen(false);
      await load();
      push({ tone: 'success', title: 'Discovery data wiped', description: result.message });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wipe failed');
    } finally {
      setWiping(false);
    }
  };

  const startRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country || !form.city || !form.industry) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api<{ run: { id: string }; message?: string }>('/api/discovery/runs', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setActiveRunId(result.run.id);
      await load();
      push({
        tone: 'success',
        title: 'Discovery run queued',
        description: result.message ?? 'Pipeline progress appears in the run monitor.',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Discovery failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(form.country && form.city && form.industry && sourcesReady && options);
  const totalPages = Math.max(1, Math.ceil(total / state.limit));
  const hasFilters = Boolean(state.q || statusFilter || hasPlanFilter);

  return (
    <div className="max-w-5xl space-y-5">
      <PageHeader
        compact
        title={PAGE_COPY.discovery.title}
        description={PAGE_COPY.discovery.description}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/discovery/plans">Discovery plans</Link>
          </Button>
        }
      />

      <CollapsibleSection
        id="discovery-sources"
        className="rounded-lg border border-line bg-surface-raised px-4 py-3"
        title="Provider status"
        open={sourcesOpen}
        onOpenChange={setSourcesOpen}
        trailing={
          budgetInfo ? (
            <span className="text-xs font-normal text-ink-muted">{budgetInfo.acquisitionMode}</span>
          ) : undefined
        }
      >
        <ul className="space-y-1 pt-2 text-sm">
          {sources.map((s) => (
            <li key={s.name} className="flex flex-wrap items-center gap-2">
              <StatusBadge
                tone={
                  s.health === 'degraded'
                    ? 'danger'
                    : s.configured && s.enabled !== false
                      ? 'success'
                      : s.configured
                        ? 'warning'
                        : 'neutral'
                }
              >
                {s.label}
              </StatusBadge>
              <span className="text-ink-muted">
                {!s.configured
                  ? 'not configured'
                  : s.health === 'degraded'
                    ? 'degraded'
                    : s.enabled === false
                      ? 'configured, disabled'
                      : 'ready'}
              </span>
              {s.reason && <span className="text-xs text-warning-foreground">({s.reason})</span>}
            </li>
          ))}
          {sources.length === 0 && <li className="text-ink-muted">Checking provider status…</li>}
        </ul>
        {budgetInfo && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs text-ink-muted sm:grid-cols-3">
            {budgetInfo.providers
              .filter((p) =>
                ['google_cse', 'bing_search', 'google_places', 'meta_graph'].includes(p.provider),
              )
              .map((p) => (
                <div key={p.provider}>
                  <span className="font-medium text-ink">{p.provider.replace(/_/g, ' ')}</span>:{' '}
                  {p.remaining}/{p.cap} left
                </div>
              ))}
          </div>
        )}
        {!sourcesReady && (
          <p className="mt-2 text-xs text-warning-foreground">
            Configure at least one source in{' '}
            <Link href="/settings#settings-credentials" className="text-accent hover:underline">
              Settings
            </Link>
            .
          </p>
        )}
      </CollapsibleSection>

      <CsvImportPanel onUploaded={() => void loadSources()} />

      {error && <ErrorState title="Discovery issue" description={error} onRetry={() => void load()} />}

      <CollapsibleSection
        id="discovery-start"
        className="rounded-lg border border-line bg-surface p-4 shadow-panel"
        title="Start discovery run"
        open={startOpen}
        onOpenChange={setStartOpen}
      >
        <form onSubmit={startRun} className="relative z-10 space-y-3 overflow-visible pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SearchableSelect
              label="Country"
              value={form.country}
              options={options?.countries ?? []}
              onChange={setCountry}
              placeholder="Search countries…"
            />
            <SearchableSelect
              label="City"
              value={form.city}
              options={cityOptions}
              onChange={(city) => setForm({ ...form, city })}
              placeholder="Search cities…"
            />
            <SearchableSelect
              label="Industry"
              value={form.industry}
              options={options?.industries ?? []}
              onChange={(industry) => setForm({ ...form, industry })}
              placeholder="Search industries…"
            />
            <label className="block text-sm">
              <span className="font-medium text-ink">Run profile</span>
              <select
                className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
                value={form.profile}
                onChange={(e) => setForm({ ...form, profile: e.target.value as RunProfile })}
              >
                <option value="micro">Micro — 0 Places</option>
                <option value="standard">Standard — ≤20 Places</option>
                <option value="boost">Boost — higher caps</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-line bg-surface-raised p-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={form.prospectFocus}
                onChange={(e) => setForm({ ...form, prospectFocus: e.target.checked })}
              />
              <span className="text-xs">
                <span className="font-medium text-ink">Prospect focus</span>
                <span className="mt-0.5 block text-ink-muted">Bias toward social-only and greenfield angles.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-line bg-surface-raised p-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={form.boiNarrative}
                onChange={(e) => setForm({ ...form, boiNarrative: e.target.checked })}
              />
              <span className="text-xs">
                <span className="font-medium text-ink">AI opportunity narrative</span>
                <span className="mt-0.5 block text-ink-muted">Optional LLM executive summary when configured.</span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              City defaults to <strong className="text-ink">{allCitiesLabel}</strong> for country-wide search.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={total === 0}
                onClick={() => setWipeOpen(true)}
              >
                Wipe all runs
              </Button>
              <Button type="submit" variant="primary" loading={submitting} disabled={!canSubmit}>
                {submitting ? 'Queuing…' : 'Run discovery'}
              </Button>
            </div>
          </div>

          <RunTerminal
            runId={activeRunId}
            runStatus={
              runs.find((r) => r.id === activeRunId)?.status ?? (submitting ? 'pending' : undefined)
            }
          />
        </form>
      </CollapsibleSection>

      <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-ink-muted">
            Search runs
            <Input
              value={draftQuery}
              placeholder="City, country, industry…"
              onChange={(event) => setDraftQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  update({ q: draftQuery.trim(), resetPage: true });
                  setActiveViewId(null);
                }
              }}
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-muted">
            Status
            <select
              className="h-9 w-full min-w-40 rounded-md border border-line bg-surface px-3 text-sm text-ink"
              value={statusFilter}
              onChange={(event) => {
                update({ filters: { ...state.filters, status: event.target.value }, resetPage: true });
                setActiveViewId(null);
              }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-muted">
            Origin
            <select
              className="h-9 w-full min-w-40 rounded-md border border-line bg-surface px-3 text-sm text-ink"
              value={hasPlanFilter}
              onChange={(event) => {
                update({
                  filters: { ...state.filters, hasPlan: event.target.value },
                  resetPage: true,
                });
                setActiveViewId(null);
              }}
            >
              <option value="">All origins</option>
              <option value="1">From plans</option>
              <option value="0">Manual only</option>
            </select>
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                update({ q: draftQuery.trim(), resetPage: true });
                setActiveViewId(null);
              }}
            >
              Apply
            </Button>
            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraftQuery('');
                  clearFilters();
                  setActiveViewId(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <SavedViewsControl
          surface="discovery_runs"
          currentDefinition={currentDefinition}
          activeViewId={activeViewId}
          onApply={applySavedView}
          onActiveViewChange={setActiveViewId}
          productPresets={RUN_PRESETS}
        />
      </div>

      {listLoading && runs.length === 0 && <Skeleton className="h-72 w-full" />}

      {!listLoading && listError && (
        <ErrorState
          title="Unable to load discovery runs"
          description={listError}
          onRetry={() => void load()}
        />
      )}

      {!listError && (runs.length > 0 || !listLoading) && (
        <>
          {runs.length === 0 ? (
            <EmptyState
              title={hasFilters ? 'No runs match these filters' : 'No discovery runs yet'}
              description={
                hasFilters
                  ? 'Clear the status filter or search to see all runs.'
                  : 'Start your first discovery run above to fill the Queue with greenfield prospects.'
              }
              action={
                hasFilters ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setDraftQuery('');
                      clearFilters();
                      setActiveViewId(null);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-panel">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-surface-raised text-left text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  <tr>
                    <th className="p-3 font-semibold">Location</th>
                    <th className="p-3 font-semibold">Industry</th>
                    <th className="p-3 font-semibold">Profile</th>
                    <th className="p-3 font-semibold">Focus</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Yield</th>
                    <th className="p-3 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-t border-line align-top hover:bg-surface-raised">
                      <td className="p-3 font-medium text-ink">
                        {formatLocation(run.city, run.country, allCitiesLabel)}
                        {run.planId ? (
                          <div className="mt-1">
                            <StatusBadge tone="info">Plan</StatusBadge>
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 text-ink">{run.industry}</td>
                      <td className="p-3 text-xs text-ink-muted">{run.runProfile ?? 'standard'}</td>
                      <td className="p-3 text-xs">
                        {run.prospectFocus ? (
                          <StatusBadge tone="success">Prospect</StatusBadge>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <StatusBadge tone={statusTone(run.status)}>{run.status}</StatusBadge>
                      </td>
                      <td className="p-3 text-xs text-ink-muted">
                        {run.stats?.accountsSaved != null ? (
                          <>
                            <span className="font-medium text-ink">{run.stats.accountsSaved}</span> saved
                            {run.stats.contactablePct != null && (
                              <span className="block">{run.stats.contactablePct}% contactable</span>
                            )}
                            {run.stats.prospectCandidates != null && run.stats.prospectCandidates > 0 && (
                              <span className="block text-accent">
                                {run.stats.prospectCandidates} prospect
                                {run.stats.highPotentialEstimate != null &&
                                  ` · ${run.stats.highPotentialEstimate} high-potential`}
                              </span>
                            )}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/discovery/${run.id}`}>Open run</Link>
                          </Button>
                          <Button size="sm" variant="secondary" asChild>
                            <Link
                              href={`/review?runId=${run.id}&acquisitionLane=greenfield&kind=opportunity`}
                            >
                              Triage
                            </Link>
                          </Button>
                          {run.planId ? (
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/discovery/plans/${run.planId}`}>Open plan</Link>
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setSavePlanRun(run)}>
                              Save as plan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {runs.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
              <p>
                Showing {(state.page - 1) * state.limit + 1}–
                {Math.min(state.page * state.limit, total)} of {total} run{total === 1 ? '' : 's'}
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
        </>
      )}

      <Dialog
        open={wipeOpen}
        onOpenChange={setWipeOpen}
        title="Delete all discovery data?"
        description="This removes every discovery run, discovered business, and pipeline job. Pursuits already promoted keep their leads, but discovery evidence is lost. This cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setWipeOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="danger" loading={wiping} onClick={() => void wipeRuns()}>
            Wipe all runs
          </Button>
        </div>
      </Dialog>

      <PlanEditorWizard
        open={Boolean(savePlanRun)}
        onOpenChange={(open) => {
          if (!open) setSavePlanRun(null);
        }}
        options={options}
        seed={
          savePlanRun
            ? {
                name: `${savePlanRun.city} ${savePlanRun.industry}`.trim(),
                country: savePlanRun.country,
                city: savePlanRun.city,
                industry: savePlanRun.industry,
                profile: (savePlanRun.runProfile as RunProfile | undefined) ?? 'standard',
                prospectFocus: savePlanRun.prospectFocus ?? true,
              }
            : null
        }
        onCreated={(planId) => {
          setSavePlanRun(null);
          window.location.href = `/discovery/plans/${planId}`;
        }}
      />
    </div>
  );
}

function DiscoverySkeleton() {
  return (
    <div className="max-w-5xl space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
