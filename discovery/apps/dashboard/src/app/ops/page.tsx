'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { MorningInbox, type MorningInboxData } from '@/components/ops/morning-inbox';
import { Button, ErrorState, Skeleton } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';

const OPS_LAST_VISIT_KEY = 'ops.lastVisitAt';

type BudgetProvider = {
  provider: string;
  used: number;
  cap: number;
  remaining: number;
};

type FailedJob = {
  id: string;
  runId: string;
  stage: string;
  errorMessage: string | null;
  attempts: number;
  failedAt: string;
  run: { industry: string; city: string; country: string; status: string };
};

type FailedJobsResponse = {
  days: number;
  count: number;
  jobs: FailedJob[];
};

type RevenueOpsMetrics = {
  mtd: number;
  allTime: number;
  dealCount: number;
  pipelineValue: number;
  pipelineDeals: number;
  pursuitsProposalSent: number;
  winRate: number | null;
  closedWon: number;
  closedLost: number;
  avgDealSize: number | null;
  demand: { revenue: number; dealCount: number };
  discovery: { revenue: number; dealCount: number };
  topDiscoveryRuns: Array<{
    runId: string;
    industry: string;
    city: string;
    country: string;
    revenue: number;
    dealCount: number;
  }>;
  topLossReasons: Array<{ reason: string; count: number }>;
  recentRevenue: Array<{
    id: string;
    amount: number;
    closedAt: string;
    businessName: string;
    source: string;
    leadId: string | null;
  }>;
  winLossBySource: Array<{
    channel: 'demand' | 'discovery';
    won: number;
    lost: number;
    winRate: number | null;
  }>;
  recentLosses: Array<{
    leadId: string;
    businessName: string;
    source: string;
    reason: string;
    lostAt: string;
  }>;
};

type OpsMetrics = {
  generatedAt: string;
  funnel: Record<string, number>;
  reviewQueue: { verified: number; unverified: number; total: number };
  demandInboxOpen: number;
  budget: {
    providers: BudgetProvider[];
    acquisitionMode: string;
    workerLastSeenAt: string | null;
    workerStale: boolean;
  };
  discovery: {
    windowDays: number;
    completed: number;
    failed: number;
    started: number;
    successRate: number | null;
    avgBusinessesPerCompletedRun: number | null;
  };
  morningInbox?: MorningInboxData;
  kpis: Array<{
    id: string;
    label: string;
    target: string;
    measurement: string;
    value: number | string | null;
  }>;
  revenue: RevenueOpsMetrics;
  learning?: {
    segments: Array<{
      segmentKey: string;
      label: string;
      industry: string | null;
      city: string | null;
      presenceClass: string | null;
      won: number;
      lost: number;
      sampleSize: number;
      winRate: number | null;
      avgProjectValueUgx: number | null;
      adjustment: number;
    }>;
    revenueByPlan: Array<{
      planId: string | null;
      planName: string;
      won: number;
      lost: number;
      revenueUgx: number;
      winRate: number | null;
    }>;
  };
};

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function formatUgx(amount: number) {
  return `UGX ${amount.toLocaleString()}`;
}

function formatSourceLabel(source: string) {
  return source === 'demand_inbox' ? 'Demand inbox' : 'Discovery';
}

function formatChannelLabel(channel: 'demand' | 'discovery') {
  return channel === 'demand' ? 'Demand inbox' : 'Discovery runs';
}

function OpsBand({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-line bg-surface p-4 shadow-panel">
      <header>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

const FUNNEL_ORDER = [
  'NEW',
  'REVIEWED',
  'CONTACTED',
  'REPLIED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'CLOSED_WON',
  'CLOSED_LOST',
  'NO_RESPONSE',
  'NOT_INTERESTED',
  'ARCHIVED',
];

export default function OpsDashboardPage() {
  const [metrics, setMetrics] = useState<OpsMetrics | null>(null);
  const [failedJobs, setFailedJobs] = useState<FailedJobsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const params = new URLSearchParams();
    try {
      const previous = localStorage.getItem(OPS_LAST_VISIT_KEY);
      if (previous) params.set('since', previous);
    } catch {
      // ignore storage failures
    }
    const qs = params.toString();
    const metricsPath = qs ? `/api/ops/metrics?${qs}` : '/api/ops/metrics';
    return Promise.all([
      api<OpsMetrics>(metricsPath),
      api<FailedJobsResponse>('/api/ops/failed-jobs?days=7'),
    ])
      .then(([m, fj]) => {
        setMetrics(m);
        setFailedJobs(fj);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load metrics'));
  };

  useEffect(() => {
    void load();
    const markVisit = () => {
      try {
        localStorage.setItem(OPS_LAST_VISIT_KEY, new Date().toISOString());
      } catch {
        // ignore
      }
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') markVisit();
    };
    window.addEventListener('beforeunload', markVisit);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      markVisit();
      window.removeEventListener('beforeunload', markVisit);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  if (error) {
    return (
      <ErrorState
        title="Could not load Today"
        description={error}
        onRetry={() => {
          setError(null);
          setMetrics(null);
          void load();
        }}
      />
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-5xl space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const funnelTotal = Object.values(metrics.funnel).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        compact
        title={PAGE_COPY.ops.title}
        description={`${PAGE_COPY.ops.description} Updated ${new Date(metrics.generatedAt).toLocaleString()}.`}
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/discovery/plans">Discovery plans</Link>
          </Button>
        }
      />

      <OpsBand title="Needs attention" description="Start here — triage, follow-ups, and automation health.">
      {metrics.morningInbox ? <MorningInbox inbox={metrics.morningInbox} /> : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/review?acquisitionLane=greenfield"
            className="rounded-md border border-line px-3 py-3 text-sm hover:bg-surface-raised"
          >
            <p className="font-medium text-ink">Queue triage</p>
            <p className="text-xs text-ink-muted">
              {metrics.reviewQueue.total} opportunit{metrics.reviewQueue.total === 1 ? 'y' : 'ies'} ·{' '}
              {metrics.demandInboxOpen ?? 0} demand
            </p>
          </Link>
          <Link
            href="/follow-ups"
            className="rounded-md border border-line px-3 py-3 text-sm hover:bg-surface-raised"
          >
            <p className="font-medium text-ink">Due follow-ups</p>
            <p className="text-xs text-ink-muted">Contacted pursuits needing a next touch</p>
          </Link>
          <Link
            href="/intent"
            className="rounded-md border border-line px-3 py-3 text-sm hover:bg-surface-raised"
          >
            <p className="font-medium text-ink">Demand inbox</p>
            <p className="text-xs text-ink-muted">Capture and match orphan signals</p>
          </Link>
          <Link
            href="/automation"
            className="rounded-md border border-line px-3 py-3 text-sm hover:bg-surface-raised"
          >
            <p className="font-medium text-ink">Automation center</p>
            <p className="text-xs text-ink-muted">Worker health and failed jobs</p>
          </Link>
        </div>

      {metrics.budget.workerStale && (
        <div className="rounded-lg border border-warning/30 bg-warning-muted p-4 text-sm text-warning-foreground">
          Worker heartbeat is stale — start <code className="rounded bg-warning-muted px-1">pnpm jobs:worker</code>{' '}
          so discovery runs complete.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-line bg-surface-raised p-4">
          <p className="text-xs text-ink-muted">Work queue backlog</p>
          <p className="text-2xl font-semibold text-ink">
            {metrics.demandInboxOpen + metrics.reviewQueue.total}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-muted">
            {metrics.demandInboxOpen} demand · {metrics.reviewQueue.verified} verified ·{' '}
            {metrics.reviewQueue.unverified} unverified
          </p>
          <Link href="/review" className="text-xs text-accent hover:underline">
            Open Queue →
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-surface-raised p-4">
          <p className="text-xs text-ink-muted">Verified opportunities</p>
          <p className="text-2xl font-semibold text-ink">{metrics.reviewQueue.verified}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface-raised p-4">
          <p className="text-xs text-ink-muted">Hot demand (open)</p>
          <p className="text-2xl font-semibold text-ink">{metrics.demandInboxOpen}</p>
          <Link href="/intent" className="text-xs text-accent hover:underline">
            Demand inbox →
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-surface-raised p-4">
          <p className="text-xs text-ink-muted">Pursuits (funnel)</p>
          <p className="text-2xl font-semibold text-ink">{funnelTotal}</p>
          <Link href="/leads" className="text-xs text-accent hover:underline">
            View Pipeline →
          </Link>
        </div>
        <div className="rounded-lg border border-danger/20 bg-danger-muted p-4">
          <p className="text-xs text-ink-muted">Failed jobs (7d)</p>
          <p className="text-2xl font-semibold text-danger-foreground">{failedJobs?.count ?? '—'}</p>
          <Link href="/discovery?status=failed" className="text-xs text-accent hover:underline">
            Failed runs →
          </Link>
        </div>
      </div>

      {failedJobs && failedJobs.jobs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised p-4">
          <h3 className="mb-3 font-semibold text-ink">
            Recent failed pipeline jobs ({failedJobs.days}d)
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Stage</th>
                <th className="py-2 pr-4">Run</th>
                <th className="py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {failedJobs.jobs.map((job) => (
                <tr key={job.id} className="border-b border-line/70 last:border-0">
                  <td className="whitespace-nowrap py-2 pr-4 text-ink-muted">
                    {new Date(job.failedAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{job.stage}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/discovery/${job.runId}`} className="text-accent hover:underline">
                      {job.run.industry} · {job.run.city}
                    </Link>
                  </td>
                  <td className="max-w-md truncate py-2 text-xs text-danger-foreground">
                    {job.errorMessage ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </OpsBand>

      <OpsBand title="Acquisition & pipeline" description="Discovery yield, budgets, and pursuit funnel.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.kpis.map((kpi) => (
            <div key={kpi.id} className="rounded-lg border border-line bg-surface-raised p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">{kpi.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{kpi.value ?? '—'}</p>
              <p className="mt-1 text-xs text-ink-muted">Target: {kpi.target}</p>
            </div>
          ))}
        </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface-raised p-4">
          <h3 className="mb-3 font-semibold text-ink">
            Discovery ({metrics.discovery.windowDays}d)
          </h3>
          <ul className="space-y-1 text-sm text-ink-muted">
            <li>Runs started: {metrics.discovery.started}</li>
            <li>Completed: {metrics.discovery.completed}</li>
            <li>Failed: {metrics.discovery.failed}</li>
            <li>
              Success rate:{' '}
              {metrics.discovery.successRate != null ? `${metrics.discovery.successRate}%` : '—'}
            </li>
            <li>
              Avg businesses / completed run:{' '}
              {metrics.discovery.avgBusinessesPerCompletedRun ?? '—'}
            </li>
          </ul>
          <Link href="/discovery" className="mt-2 inline-block text-xs text-accent hover:underline">
            Discovery runs →
          </Link>
        </section>

        <section className="rounded-lg border border-line bg-surface-raised p-4">
          <h3 className="mb-3 font-semibold text-ink">
            Budget ({metrics.budget.acquisitionMode})
          </h3>
          <ul className="space-y-2 text-sm">
            {metrics.budget.providers.map((p) => (
              <li key={p.provider} className="flex justify-between gap-2">
                <span className="text-ink-muted">{p.provider}</span>
                <span className="font-mono text-ink">
                  {p.used}/{p.cap}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Worker last seen:{' '}
            {metrics.budget.workerLastSeenAt
              ? new Date(metrics.budget.workerLastSeenAt).toLocaleString()
              : 'never'}
          </p>
        </section>
      </div>

      <section className="rounded-lg border border-line bg-surface-raised p-4">
        <h3 className="mb-3 font-semibold text-ink">
          Pursuit funnel ({funnelTotal} total)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {FUNNEL_ORDER.filter((s) => metrics.funnel[s] != null).map((status) => (
                <tr key={status} className="border-b border-line/70 last:border-0">
                  <td className="py-2 pr-4 font-medium text-ink">{status}</td>
                  <td className="py-2">{metrics.funnel[status]}</td>
                </tr>
              ))}
              {Object.entries(metrics.funnel)
                .filter(([s]) => !FUNNEL_ORDER.includes(s))
                .map(([status, count]) => (
                  <tr key={status} className="border-b border-line/70">
                    <td className="py-2 pr-4 font-medium text-ink">{status}</td>
                    <td className="py-2">{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      </OpsBand>

      <OpsBand title="Revenue & learning" description="North-star proof and closed-loop acquisition learning.">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-semibold text-slate-900">Revenue proof</h3>
          <Link href="/revenue" className="text-xs text-brand-700 hover:underline">
            Close deals →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-xs text-emerald-800">MTD revenue</p>
            <p className="text-2xl font-semibold text-emerald-950">
              {formatMoney(metrics.revenue.mtd)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">All-time revenue</p>
            <p className="text-2xl font-semibold">{formatMoney(metrics.revenue.allTime)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{metrics.revenue.dealCount} deal(s)</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Pipeline value</p>
            <p className="text-2xl font-semibold">{formatMoney(metrics.revenue.pipelineValue)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {metrics.revenue.pipelineDeals} PROPOSAL_SENT
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Win rate</p>
            <p className="text-2xl font-semibold">
              {metrics.revenue.winRate != null ? `${metrics.revenue.winRate}%` : '—'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {metrics.revenue.closedWon}W / {metrics.revenue.closedLost}L
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Avg deal size</p>
            <p className="text-2xl font-semibold">
              {metrics.revenue.avgDealSize != null
                ? formatMoney(metrics.revenue.avgDealSize)
                : '—'}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Open proposals</p>
            <p className="text-2xl font-semibold">{metrics.revenue.pursuitsProposalSent}</p>
            <Link href="/proposals" className="text-[10px] text-brand-700 hover:underline">
              View proposals →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Revenue by source</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li className="flex justify-between gap-2">
                <span>Discovery runs</span>
                <span className="font-medium">
                  {formatMoney(metrics.revenue.discovery.revenue)}{' '}
                  <span className="text-slate-500 font-normal">
                    ({metrics.revenue.discovery.dealCount} deals)
                  </span>
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Demand inbox</span>
                <span className="font-medium">
                  {formatMoney(metrics.revenue.demand.revenue)}{' '}
                  <span className="text-slate-500 font-normal">
                    ({metrics.revenue.demand.dealCount} deals)
                  </span>
                </span>
              </li>
            </ul>
            {metrics.revenue.topDiscoveryRuns.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Top discovery runs
                </p>
                <ul className="text-sm space-y-1.5">
                  {metrics.revenue.topDiscoveryRuns.map((run) => (
                    <li key={run.runId} className="flex justify-between gap-2">
                      <Link
                        href={`/discovery/${run.runId}`}
                        className="text-brand-700 hover:underline truncate"
                      >
                        {run.industry} · {run.city}
                      </Link>
                      <span className="shrink-0 font-medium">
                        {formatMoney(run.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
            {metrics.revenue.recentRevenue.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Recent closed revenue</h4>
                <ul className="text-sm space-y-2">
                  {metrics.revenue.recentRevenue.map((r) => (
                    <li key={r.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {r.leadId ? (
                          <Link
                            href={`/leads/${r.leadId}`}
                            className="text-brand-700 hover:underline"
                          >
                            {r.businessName}
                          </Link>
                        ) : (
                          r.businessName
                        )}
                        <span className="text-slate-500 text-xs ml-1">· {r.source}</span>
                      </span>
                      <span className="font-medium shrink-0">{formatMoney(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No closed revenue yet — north-star metric for v1.
              </p>
            )}

          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-ink">Outcome learning</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              CRM closed-won/lost feed segment scoring and plan yield. Sample ≥ 5 before
              adjustments apply.
            </p>
          </div>
          <Link href="/discovery/plans" className="text-xs text-brand-700 hover:underline">
            Plans →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Conversion by segment</h4>
            {metrics.learning && metrics.learning.segments.length > 0 ? (
              <ul className="text-sm space-y-2">
                {metrics.learning.segments.map((seg) => (
                  <li
                    key={seg.segmentKey}
                    className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{seg.label}</p>
                      <p className="text-[10px] text-slate-500">
                        {seg.won}W / {seg.lost}L · n={seg.sampleSize}
                        {seg.adjustment !== 0
                          ? ` · score adj ${seg.adjustment > 0 ? '+' : ''}${seg.adjustment}`
                          : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold">
                        {seg.winRate != null ? `${seg.winRate}%` : '—'}
                      </p>
                      {seg.avgProjectValueUgx != null ? (
                        <p className="text-[10px] text-slate-500">
                          avg {formatUgx(seg.avgProjectValueUgx)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No segment outcomes yet. Push prospects to SleeklyBuilt CRM and close deals —
                outcomes sync automatically.
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Revenue by plan</h4>
            {metrics.learning && metrics.learning.revenueByPlan.length > 0 ? (
              <ul className="text-sm space-y-2">
                {metrics.learning.revenueByPlan.map((row) => (
                  <li
                    key={row.planId ?? row.planName}
                    className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      {row.planId ? (
                        <Link
                          href={`/discovery/plans/${row.planId}`}
                          className="font-medium text-brand-700 hover:underline truncate block"
                        >
                          {row.planName}
                        </Link>
                      ) : (
                        <p className="font-medium text-slate-900 truncate">{row.planName}</p>
                      )}
                      <p className="text-[10px] text-slate-500">
                        {row.won}W / {row.lost}L
                        {row.winRate != null ? ` · ${row.winRate}% win` : ''}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">{formatUgx(row.revenueUgx)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No plan-attributed CRM revenue yet. Close won deals on leads that came from
                scheduled plan runs.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-ink">Win/loss summary</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Learn what to hunt more of — compare demand vs discovery close rates.
            </p>
          </div>
          <Link href="/leads" className="text-xs text-brand-700 hover:underline">
            Pursuits →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {metrics.revenue.winLossBySource.map((row) => (
            <div
              key={row.channel}
              className={`rounded-lg p-4 border ${
                row.channel === 'demand'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-600">{formatChannelLabel(row.channel)}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {row.winRate != null ? `${row.winRate}%` : '—'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {row.won}W / {row.lost}L closed
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Recent losses</h4>
            {metrics.revenue.recentLosses.length > 0 ? (
              <ul className="text-sm space-y-2">
                {metrics.revenue.recentLosses.map((loss) => (
                  <li key={`${loss.leadId}-${loss.lostAt}`} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/leads/${loss.leadId}`}
                        className="text-brand-700 hover:underline truncate font-medium"
                      >
                        {loss.businessName}
                      </Link>
                      <span className="text-slate-500 text-xs shrink-0">
                        {formatSourceLabel(loss.source)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5 truncate">{loss.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No closed losses yet — record reasons when marking pursuits CLOSED_LOST.
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Top loss reasons</h4>
            {metrics.revenue.topLossReasons.length > 0 ? (
              <ul className="text-sm space-y-1 text-slate-700">
                {metrics.revenue.topLossReasons.map((row) => (
                  <li key={row.reason} className="flex justify-between gap-2">
                    <span className="truncate">{row.reason}</span>
                    <span className="text-slate-500 shrink-0">{row.count}×</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">
                Loss reasons appear when you close pursuits with a note.
              </p>
            )}
          </div>
        </div>
      </OpsBand>
    </div>
  );
}
