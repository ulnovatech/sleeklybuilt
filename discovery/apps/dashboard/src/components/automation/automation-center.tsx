'use client';

import { AlertTriangle, CheckCircle2, Clock3, DatabaseZap, LoaderCircle, RefreshCw, ServerCog } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useApiQuery } from '@/lib/use-api-query';

type FailedJob = {
  id: string;
  runId: string;
  stage: string;
  errorMessage: string | null;
  attempts: number;
  failedAt: string;
  run: { industry: string; city: string; country: string; status: string };
};

type FailedJobsResponse = { days: number; count: number; jobs: FailedJob[] };
type DiscoveryRun = { id: string; country: string; city: string; industry: string; status: 'pending' | 'running' | 'completed' | 'failed'; startedAt: string | null };
type DiscoveryRunsResponse = { runs: DiscoveryRun[] };
type DiscoverySource = { name: string; label: string; configured: boolean; enabled: boolean; reason?: string; health?: 'healthy' | 'degraded' | 'pending' };
type DiscoverySourcesResponse = { sources: DiscoverySource[]; ready: boolean; message?: string };
type BulkOperation = {
  id: string;
  surface: string;
  action: string;
  selectionScope: string;
  requestedCount: number;
  succeededCount: number;
  failedCount: number;
  note: string | null;
  createdAt: string;
  failures: Array<{ id: string; error: string }>;
};
type BulkOperationsResponse = { operations: BulkOperation[]; failedTotal: number };
type OpsMetrics = {
  generatedAt: string;
  budget: { workerLastSeenAt: string | null; workerStale: boolean };
  discovery: { completed: number; failed: number; started: number; successRate: number | null };
  reviewQueue: { total: number };
  demandInboxOpen: number;
};

function formatTimestamp(value: string | null) {
  if (!value) return 'No heartbeat recorded';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

const SURFACE_ROUTES: Record<string, string> = {
  leads: '/leads',
  work_queue: '/review',
  review_queue: '/review',
  demand_inbox: '/intent',
};

function formatSurface(surface: string) {
  return surface.replace(/_/g, ' ');
}

export function AutomationCenter() {
  const metrics = useApiQuery<OpsMetrics>('/api/ops/metrics', { intervalMs: 30000 });
  const failures = useApiQuery<FailedJobsResponse>('/api/ops/failed-jobs?days=7&limit=8', { intervalMs: 30000 });
  const runs = useApiQuery<DiscoveryRunsResponse>('/api/discovery/runs', { intervalMs: 15000 });
  const sources = useApiQuery<DiscoverySourcesResponse>('/api/discovery/sources', { intervalMs: 60000 });
  const bulkOps = useApiQuery<BulkOperationsResponse>('/api/operator/bulk-operations?limit=8', {
    intervalMs: 60000,
  });
  const [expandedOperationId, setExpandedOperationId] = useState<string | null>(null);
  const { push } = useToast();

  const retryRun = async (runId: string) => {
    try {
      await api(`/api/discovery/runs/${runId}/retry`, { method: 'POST' });
      push({ tone: 'success', title: 'Run queued for retry', description: 'Automation Center will refresh its state shortly.' });
      await Promise.all([metrics.refresh(), failures.refresh(), runs.refresh()]);
    } catch (error) {
      push({ tone: 'error', title: 'Could not retry this run', description: error instanceof Error ? error.message : 'Request failed.' });
    }
  };

  if (metrics.isLoading || failures.isLoading || runs.isLoading || sources.isLoading) {
    return <AutomationCenterSkeleton />;
  }
  if (metrics.error || failures.error || runs.error || sources.error || !metrics.data || !failures.data || !runs.data || !sources.data) {
    return <ErrorState description={(metrics.error ?? failures.error ?? runs.error ?? sources.error)?.message ?? 'Automation health could not be retrieved.'} onRetry={() => void Promise.all([metrics.refresh(), failures.refresh(), runs.refresh(), sources.refresh()])} />;
  }

  const workerHealthy = !metrics.data.budget.workerStale;
  const activeRuns = runs.data.runs.filter((run) => run.status === 'pending' || run.status === 'running');
  const cards = [
    { label: 'Worker', value: workerHealthy ? 'Healthy' : 'Needs attention', note: formatTimestamp(metrics.data.budget.workerLastSeenAt), tone: workerHealthy ? 'success' as const : 'danger' as const, icon: ServerCog },
    { label: 'Queued / processing', value: String(activeRuns.length), note: `${metrics.data.discovery.started} started in current window`, tone: activeRuns.length > 0 ? 'info' as const : 'neutral' as const, icon: LoaderCircle },
    { label: 'Awaiting review', value: String(metrics.data.reviewQueue.total + metrics.data.demandInboxOpen), note: `${metrics.data.reviewQueue.total} intelligence · ${metrics.data.demandInboxOpen} demand`, tone: 'warning' as const, icon: Clock3 },
    { label: 'Failed jobs', value: String(failures.data.count), note: `${metrics.data.discovery.failed} discovery runs failed`, tone: failures.data.count ? 'danger' as const : 'success' as const, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, tone, icon: Icon }) => (
          <article key={label} className="rounded-lg border border-line bg-surface p-4 shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-ink-muted">{label}</p>
              <Icon className="h-4 w-4 text-ink-faint" aria-hidden="true" />
            </div>
            <p className="mt-3 text-xl font-semibold tracking-tight text-ink">{value}</p>
            <div className="mt-2"><StatusBadge tone={tone}>{note}</StatusBadge></div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Failed work</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Retry only runs whose inputs and credentials are still valid.</p>
          </div>
          <Button size="sm" onClick={() => void Promise.all([metrics.refresh(), failures.refresh(), runs.refresh(), sources.refresh()])} loading={metrics.isRefreshing || failures.isRefreshing || runs.isRefreshing || sources.isRefreshing}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </header>
        {failures.data.jobs.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-8 text-sm text-ink-muted">
            <CheckCircle2 className="h-4 w-4 text-success" /> No failed jobs in the last {failures.data.days} days.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {failures.data.jobs.map((job) => (
              <article key={job.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{job.run.industry} · {job.run.city}</p>
                    <StatusBadge tone="danger">{job.stage}</StatusBadge>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-muted">{job.errorMessage ?? 'No failure detail recorded'} · attempt {job.attempts}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/discovery/${job.runId}`} className="text-xs font-medium text-accent hover:underline">Inspect</Link>
                  <Button size="sm" variant="secondary" onClick={() => void retryRun(job.runId)}>Retry run</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Bulk operations</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Audited batch actions you ran, with the rows that did not apply.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            loading={bulkOps.isRefreshing}
            onClick={() => void bulkOps.refresh()}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </header>
        {bulkOps.error ? (
          <div className="px-4 py-6">
            <ErrorState
              title="Bulk operation history unavailable"
              description={bulkOps.error.message}
              onRetry={() => void bulkOps.refresh()}
            />
          </div>
        ) : bulkOps.isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (bulkOps.data?.operations.length ?? 0) === 0 ? (
          <div className="flex items-center gap-3 px-4 py-8 text-sm text-ink-muted">
            <CheckCircle2 className="h-4 w-4 text-success" /> No bulk actions recorded yet. Batch
            actions from Queue, Pipeline, Follow-ups, and Demand appear here.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {bulkOps.data?.operations.map((operation) => {
              const expanded = expandedOperationId === operation.id;
              return (
                <article key={operation.id} className="px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink">{operation.action}</p>
                        <StatusBadge tone="neutral">{formatSurface(operation.surface)}</StatusBadge>
                        <StatusBadge tone={operation.failedCount > 0 ? 'danger' : 'success'}>
                          {operation.succeededCount}/{operation.requestedCount} applied
                        </StatusBadge>
                      </div>
                      <p className="mt-1 truncate text-xs text-ink-muted">
                        {formatTimestamp(operation.createdAt)}
                        {operation.note ? ` · ${operation.note}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {operation.failedCount > 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-expanded={expanded}
                          onClick={() => setExpandedOperationId(expanded ? null : operation.id)}
                        >
                          {expanded ? 'Hide failures' : `${operation.failedCount} failed`}
                        </Button>
                      )}
                      {SURFACE_ROUTES[operation.surface] && (
                        <Link
                          href={SURFACE_ROUTES[operation.surface]}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Open surface
                        </Link>
                      )}
                    </div>
                  </div>
                  {expanded && operation.failures.length > 0 && (
                    <ul className="mt-3 space-y-1 rounded-md border border-line bg-surface-raised p-2">
                      {operation.failures.map((failure) => (
                        <li key={failure.id} className="text-xs text-ink-muted">
                          <span className="font-mono text-ink">{failure.id.slice(0, 8)}</span> —{' '}
                          {failure.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
          <header className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Active pipelines</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Every active discovery run is shown from the live queue.</p>
          </header>
          {activeRuns.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-8 text-sm text-ink-muted"><CheckCircle2 className="h-4 w-4 text-success" /> No discovery pipelines are currently queued or processing.</div>
          ) : (
            <div className="divide-y divide-line">
              {activeRuns.map((run) => (
                <Link key={run.id} href={`/discovery/${run.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-raised">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{run.industry} · {run.city}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{run.country} · {run.startedAt ? formatTimestamp(run.startedAt) : 'Awaiting start'}</p>
                  </div>
                  <StatusBadge tone={run.status === 'running' ? 'info' : 'neutral'}>{run.status === 'running' ? 'Processing' : 'Queued'}</StatusBadge>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
          <header className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Source readiness</h2>
            <p className="mt-0.5 text-xs text-ink-muted">{sources.data.message ?? 'Configured providers and ingest health.'}</p>
          </header>
          <div className="divide-y divide-line">
            {sources.data.sources.map((source) => {
              const tone = source.health === 'degraded' ? 'danger' as const : source.enabled ? 'success' as const : 'neutral' as const;
              return (
                <div key={source.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0"><p className="truncate text-sm text-ink">{source.label}</p>{source.reason && <p className="truncate text-xs text-ink-muted">{source.reason}</p>}</div>
                  <StatusBadge tone={tone}><DatabaseZap className="h-3 w-3" />{source.enabled ? 'Ready' : source.health === 'degraded' ? 'Degraded' : 'Off'}</StatusBadge>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function AutomationCenterSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}
