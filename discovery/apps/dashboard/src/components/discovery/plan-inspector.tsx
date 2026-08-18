'use client';

import Link from 'next/link';
import { Button, Skeleton, StatusBadge } from '@/components/ui/primitives';

export type PlanInspectorRow = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  planType: string;
  runProfile: string;
  priority: number;
  prospectFocus?: boolean;
  nextRunAt: string | null;
  lastRunAt: string | null;
  consecutiveFailures?: number;
  pausedReason?: string | null;
  cadence: { everyHours?: number };
  targets: {
    countries?: string[];
    industries?: string[];
    citiesByCountry?: Record<string, string[]>;
  };
  filters?: { presence?: string };
  sources?: string[];
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
  if (status === 'active') return 'success' as const;
  if (status === 'paused') return 'warning' as const;
  return 'neutral' as const;
}

export function PlanInspectorActions({
  plan,
  busy,
  onRunNow,
  onPause,
  onResume,
  onArchive,
}: {
  plan: PlanInspectorRow | null;
  busy?: boolean;
  onRunNow: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
}) {
  if (!plan) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" loading={busy} onClick={onRunNow}>
        Run now
      </Button>
      {plan.status === 'active' ? (
        <Button size="sm" variant="secondary" disabled={busy} onClick={onPause}>
          Pause
        </Button>
      ) : plan.status === 'paused' ? (
        <Button size="sm" variant="secondary" disabled={busy} onClick={onResume}>
          Resume
        </Button>
      ) : null}
      {plan.status !== 'archived' ? (
        <Button size="sm" variant="ghost" disabled={busy} onClick={onArchive}>
          Archive
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" asChild>
        <Link href={`/discovery/plans/${plan.id}`}>Open detail</Link>
      </Button>
    </div>
  );
}

export function PlanInspector({
  plan,
  loading,
  busy,
  onRunNow,
  onPause,
  onResume,
  onArchive,
  hideActions = false,
}: {
  plan: PlanInspectorRow | null;
  loading?: boolean;
  busy?: boolean;
  onRunNow: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
  hideActions?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3 p-1">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <p className="p-1 text-sm text-ink-muted">
        Select a plan row to inspect schedule, targets, and actions.
      </p>
    );
  }

  const countries = plan.targets.countries ?? [];
  const industries = plan.targets.industries ?? [];
  const cityCount = Object.values(plan.targets.citiesByCountry ?? {}).reduce(
    (n, cities) => n + cities.length,
    0,
  );

  return (
    <div className="space-y-4 p-1">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-ink">{plan.name}</h3>
          <StatusBadge tone={statusTone(plan.status)}>{plan.status}</StatusBadge>
        </div>
        {plan.description ? (
          <p className="mt-1 text-sm text-ink-muted">{plan.description}</p>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-ink-faint">Profile</dt>
          <dd className="text-ink">{plan.runProfile}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Cadence</dt>
          <dd className="text-ink">every {plan.cadence?.everyHours ?? '—'}h</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Next run</dt>
          <dd className="text-ink">{formatWhen(plan.nextRunAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Last run</dt>
          <dd className="text-ink">{formatWhen(plan.lastRunAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Priority</dt>
          <dd className="text-ink">{plan.priority}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Presence</dt>
          <dd className="text-ink">{plan.filters?.presence ?? 'greenfield'}</dd>
        </div>
      </dl>

      <div className="rounded-md border border-line bg-surface-raised p-3 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Targets</p>
        <p className="mt-1 text-ink">
          {countries.slice(0, 3).join(', ') || '—'}
          {countries.length > 3 ? ` +${countries.length - 3}` : ''}
        </p>
        <p className="mt-1 text-ink-muted">
          {cityCount || '—'} cities · {industries.slice(0, 4).join(', ') || '—'}
          {industries.length > 4 ? ` +${industries.length - 4}` : ''}
        </p>
        {plan.prospectFocus ? (
          <p className="mt-2">
            <StatusBadge tone="success">Prospect focus</StatusBadge>
          </p>
        ) : null}
        {plan.pausedReason ? (
          <p className="mt-2 text-xs text-amber-800">Paused: {plan.pausedReason}</p>
        ) : null}
        {(plan.consecutiveFailures ?? 0) > 0 ? (
          <p className="mt-2 text-xs text-red-700">
            {plan.consecutiveFailures} consecutive failure
            {plan.consecutiveFailures === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      {!hideActions ? (
        <PlanInspectorActions
          plan={plan}
          busy={busy}
          onRunNow={onRunNow}
          onPause={onPause}
          onResume={onResume}
          onArchive={onArchive}
        />
      ) : null}
    </div>
  );
}
