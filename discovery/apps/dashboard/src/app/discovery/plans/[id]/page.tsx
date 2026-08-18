'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

type PlanDetail = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  planType: string;
  runProfile: string;
  priority: number;
  prospectFocus: boolean;
  boiNarrative: boolean;
  nextRunAt: string | null;
  lastRunAt: string | null;
  pausedReason: string | null;
  consecutiveFailures: number;
  sources: string[];
  cadence: { everyHours?: number };
  limits: { maxRunsPerDay?: number; maxConcurrentRuns?: number };
  filters: { presence?: string };
  targets: {
    countries?: string[];
    industries?: string[];
    citiesByCountry?: Record<string, string[]>;
  };
};

type PlanTarget = {
  id: string;
  country: string;
  city: string;
  industry: string;
  lastRunAt: string | null;
  lastRunId: string | null;
  runCount: number;
  yieldScore: number;
  lastYield: Record<string, unknown> | null;
  suppressedUntil: string | null;
};

type PlanEvent = {
  id: string;
  type: string;
  message: string | null;
  runId: string | null;
  createdAt: string;
};

type RecentRun = {
  id: string;
  country: string;
  city: string;
  industry: string;
  status: string;
  trigger?: string;
  createdAt: string;
  completedAt: string | null;
  stats?: {
    newAccounts?: number;
    knownFresh?: number;
    qualified?: number;
    skippedEnrichment?: number;
    avgScore?: number | null;
  } | null;
};

function formatWhen(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusTone(status: string) {
  if (status === 'active' || status === 'completed') return 'success' as const;
  if (status === 'paused' || status === 'running') return 'warning' as const;
  if (status === 'failed') return 'danger' as const;
  return 'neutral' as const;
}

function yieldNumber(yieldObj: Record<string, unknown> | null, key: string): number | null {
  if (!yieldObj) return null;
  const value = yieldObj[key];
  return typeof value === 'number' ? value : null;
}

export default function DiscoveryPlanDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { push } = useToast();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [targets, setTargets] = useState<PlanTarget[]>([]);
  const [events, setEvents] = useState<PlanEvent[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{
        plan: PlanDetail;
        targets: PlanTarget[];
        events: PlanEvent[];
        recentRuns: RecentRun[];
      }>(`/api/discovery/plans/${id}`);
      setPlan(data.plan);
      setTargets(data.targets);
      setEvents(data.events);
      setRecentRuns(data.recentRuns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchStatus(status: 'active' | 'paused' | 'archived') {
    setBusy(true);
    try {
      await api(`/api/discovery/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          pausedReason: status === 'paused' ? 'Paused by operator' : null,
        }),
      });
      push({
        title:
          status === 'active'
            ? 'Plan resumed'
            : status === 'paused'
              ? 'Plan paused'
              : 'Plan archived',
        tone: 'success',
      });
      await load();
    } catch (e) {
      push({
        title: 'Update failed',
        description: e instanceof Error ? e.message : String(e),
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  async function runNow(targetId?: string) {
    setBusy(true);
    try {
      const result = await api<{ run: { id: string } }>(`/api/discovery/plans/${id}/run`, {
        method: 'POST',
        body: JSON.stringify(targetId ? { targetId } : {}),
      });
      push({ title: 'Run queued', tone: 'success' });
      router.push(`/discovery/${result.run.id}`);
    } catch (e) {
      push({
        title: 'Run failed',
        description: e instanceof Error ? e.message : String(e),
        tone: 'error',
      });
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState title="Could not load plan" description={error} onRetry={() => void load()} />
    );
  }

  if (!plan) {
    return (
      <EmptyState
        title="Plan not found"
        description="It may have been archived or the link is stale."
        action={
          <Button asChild size="sm">
            <Link href="/discovery/plans">Back to plans</Link>
          </Button>
        }
      />
    );
  }

  const qualityTotals = targets.reduce(
    (acc, t) => {
      acc.newAccounts += yieldNumber(t.lastYield, 'newAccounts') ?? 0;
      acc.qualified += yieldNumber(t.lastYield, 'qualified') ?? 0;
      acc.skipped += yieldNumber(t.lastYield, 'skippedEnrichment') ?? 0;
      return acc;
    },
    { newAccounts: 0, qualified: 0, skipped: 0 },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={plan.name}
        description={
          plan.description ||
          `${plan.planType} plan · ${plan.runProfile} · every ${plan.cadence?.everyHours ?? '—'}h`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/discovery/plans">All plans</Link>
            </Button>
            <Button size="sm" loading={busy} onClick={() => void runNow()}>
              Run now
            </Button>
            {plan.status === 'active' ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => void patchStatus('paused')}
              >
                Pause
              </Button>
            ) : plan.status === 'paused' ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => void patchStatus('active')}
              >
                Resume
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={statusTone(plan.status)}>{plan.status}</StatusBadge>
        {plan.prospectFocus ? <StatusBadge tone="success">Prospect focus</StatusBadge> : null}
        <StatusBadge tone="neutral">{plan.filters?.presence ?? 'greenfield'}</StatusBadge>
        <span className="text-xs text-ink-muted">
          Next {formatWhen(plan.nextRunAt)} · Last {formatWhen(plan.lastRunAt)}
        </span>
      </div>

      <section className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Quality (last yield across targets)</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-line bg-surface-raised p-3">
            <p className="text-xs uppercase tracking-wide text-ink-faint">New accounts</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
              {qualityTotals.newAccounts}
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-raised p-3">
            <p className="text-xs uppercase tracking-wide text-ink-faint">Qualified</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
              {qualityTotals.qualified}
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-raised p-3">
            <p className="text-xs uppercase tracking-wide text-ink-faint">Skipped enrich</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{qualityTotals.skipped}</p>
          </div>
          <div className="rounded-md border border-line bg-surface-raised p-3">
            <p className="text-xs uppercase tracking-wide text-ink-faint">Targets</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{targets.length}</p>
          </div>
        </div>
        {plan.pausedReason ? (
          <p className="mt-3 text-sm text-amber-800">Paused reason: {plan.pausedReason}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Per-target yield</h2>
        {targets.length === 0 ? (
          <EmptyState
            title="No targets expanded"
            description="Edit the plan targets so the scheduler has segments to rotate."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-2 py-2 font-medium">Segment</th>
                  <th className="px-2 py-2 font-medium">Runs</th>
                  <th className="px-2 py-2 font-medium">Yield score</th>
                  <th className="px-2 py-2 font-medium">Last yield</th>
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((target) => (
                  <tr key={target.id} className="border-b border-line last:border-0">
                    <td className="px-2 py-2">
                      <div className="font-medium text-ink">
                        {target.city}, {target.country}
                      </div>
                      <div className="text-xs text-ink-muted">{target.industry}</div>
                    </td>
                    <td className="px-2 py-2 text-ink-muted">{target.runCount}</td>
                    <td className="px-2 py-2 tabular-nums text-ink">{target.yieldScore.toFixed(1)}</td>
                    <td className="px-2 py-2 text-xs text-ink-muted">
                      {target.lastYield
                        ? `${yieldNumber(target.lastYield, 'newAccounts') ?? 0} new · ${
                            yieldNumber(target.lastYield, 'qualified') ?? 0
                          } qualified`
                        : '—'}
                      <div className="mt-0.5">{formatWhen(target.lastRunAt)}</div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => void runNow(target.id)}
                        >
                          Run
                        </Button>
                        {target.lastRunId ? (
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/discovery/${target.lastRunId}`}>Last run</Link>
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Run history</h2>
          {recentRuns.length === 0 ? (
            <p className="text-sm text-ink-muted">No runs from this plan yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentRuns.map((run) => (
                <li
                  key={run.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2"
                >
                  <div>
                    <Link
                      href={`/discovery/${run.id}`}
                      className="text-sm font-medium text-brand-700 hover:underline"
                    >
                      {run.city}, {run.country} · {run.industry}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {formatWhen(run.createdAt)}
                      {run.stats?.newAccounts != null
                        ? ` · ${run.stats.newAccounts} new / ${run.stats.qualified ?? 0} qualified`
                        : ''}
                    </p>
                  </div>
                  <StatusBadge tone={statusTone(run.status)}>{run.status}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Event log</h2>
          {events.length === 0 ? (
            <p className="text-sm text-ink-muted">No scheduler events yet.</p>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-y-auto">
              {events.map((event) => (
                <li key={event.id} className="rounded-md border border-line px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone="neutral">{event.type}</StatusBadge>
                    <span className="text-xs text-ink-muted">{formatWhen(event.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-ink-muted">{event.message || '—'}</p>
                  {event.runId ? (
                    <Link
                      href={`/discovery/${event.runId}`}
                      className="mt-1 inline-block text-xs text-brand-700 hover:underline"
                    >
                      Open run
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-line bg-surface p-4 text-sm text-ink-muted">
        <p>
          Sources: {(plan.sources ?? []).join(', ') || '—'} · Caps:{' '}
          {plan.limits?.maxRunsPerDay ?? 8}/day · concurrent{' '}
          {plan.limits?.maxConcurrentRuns ?? 1}
          {plan.boiNarrative ? ' · AI narrative on' : ''}
        </p>
      </section>
    </div>
  );
}
