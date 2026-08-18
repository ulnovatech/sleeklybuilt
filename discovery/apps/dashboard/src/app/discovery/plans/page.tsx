'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlanEditorWizard,
  type DiscoveryOptions,
} from '@/components/discovery/plan-editor-wizard';
import {
  PlanInspector,
  PlanInspectorActions,
  type PlanInspectorRow,
} from '@/components/discovery/plan-inspector';
import { PageHeader } from '@/components/layout/page-header';
import {
  SavedViewsControl,
  type ProductSavedView,
  type SavedView,
  type SavedViewDefinition,
} from '@/components/operator/saved-views-control';
import { DataTable } from '@/components/ui/data-table';
import {
  Button,
  ErrorState,
  Input,
  InspectorDrawer,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import { useListView } from '@/lib/use-list-view';

type PlanRow = PlanInspectorRow & {
  updatedAt?: string;
  createdAt?: string;
};

const PLAN_PRESETS: ProductSavedView[] = [
  {
    id: 'preset:active',
    name: 'Active schedules',
    definition: {
      filters: { status: 'active' },
      sort: 'nextRunAt',
      direction: 'asc',
      density: 'compact',
    },
  },
  {
    id: 'preset:due-soon',
    name: 'Due soon',
    definition: {
      filters: { status: 'active' },
      sort: 'nextRunAt',
      direction: 'asc',
      density: 'compact',
    },
  },
  {
    id: 'preset:paused',
    name: 'Paused',
    definition: {
      filters: { status: 'paused' },
      sort: 'updatedAt',
      direction: 'desc',
      density: 'compact',
    },
  },
  {
    id: 'preset:all',
    name: 'All plans',
    definition: { filters: {}, sort: 'updatedAt', direction: 'desc', density: 'compact' },
  },
];

function formatWhen(iso: string | null) {
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

function PlansSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export default function DiscoveryPlansPage() {
  return (
    <Suspense fallback={<PlansSkeleton />}>
      <PlansPageInner />
    </Suspense>
  );
}

function PlansPageInner() {
  const { push } = useToast();
  const router = useRouter();
  const { state, update, clearFilters, toQueryString } = useListView({
    sort: 'updatedAt',
    direction: 'desc',
    limit: 50,
  });
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [items, setItems] = useState<PlanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<DiscoveryOptions | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const statusFilter = state.filters.status ?? '';
  const planTypeFilter = state.filters.planType ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ items: PlanRow[]; total: number }>(
        `/api/discovery/plans?${toQueryString()}`,
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [toQueryString]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void api<DiscoveryOptions>('/api/discovery/options')
      .then(setOptions)
      .catch(() => undefined);
  }, []);

  const inspected = useMemo(
    () => items.find((p) => p.id === inspectedId) ?? null,
    [inspectedId, items],
  );

  const currentDefinition: SavedViewDefinition = useMemo(
    () => ({
      filters: { ...state.filters },
      sort: state.sort,
      direction: state.direction,
      density: state.density,
    }),
    [state.density, state.direction, state.filters, state.sort],
  );

  const hasFilters = Boolean(state.q || statusFilter || planTypeFilter);

  function applySavedView(view: SavedView) {
    const def = view.definition;
    update({
      filters: def.filters ?? {},
      sort: def.sort ?? 'updatedAt',
      direction: def.direction ?? 'desc',
      density: def.density ?? 'compact',
      q: '',
      resetPage: true,
    });
    setDraftQuery('');
    setActiveViewId(view.id);
  }

  async function patchStatus(id: string, status: 'active' | 'paused' | 'archived') {
    setBusyId(id);
    try {
      await api(`/api/discovery/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          pausedReason:
            status === 'paused' ? 'Paused by operator' : status === 'archived' ? null : null,
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
      setBusyId(null);
    }
  }

  async function runNow(id: string) {
    setBusyId(id);
    try {
      const result = await api<{ run: { id: string } }>(`/api/discovery/plans/${id}/run`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      push({ title: 'Run queued', description: 'Pipeline started from this plan.', tone: 'success' });
      router.push(`/discovery/${result.run.id}`);
    } catch (e) {
      push({
        title: 'Run failed',
        description: e instanceof Error ? e.message : String(e),
        tone: 'error',
      });
      setBusyId(null);
    }
  }

  const columns = useMemo<ColumnDef<PlanRow, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Plan',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-ink">{row.original.name}</div>
            <div className="text-xs text-ink-muted">
              {row.original.runProfile}
              {row.original.prospectFocus ? ' · prospect focus' : ''} · p
              {row.original.priority}
            </div>
          </div>
        ),
      },
      {
        id: 'targets',
        header: 'Targets',
        cell: ({ row }) => {
          const countries = row.original.targets.countries ?? [];
          const industries = row.original.targets.industries ?? [];
          return (
            <div className="text-sm text-ink-muted">
              {countries.slice(0, 2).join(', ') || '—'}
              {industries.length ? ` · ${industries.slice(0, 2).join(', ')}` : ''}
            </div>
          );
        },
      },
      {
        id: 'cadence',
        header: 'Cadence',
        cell: ({ row }) => (
          <span className="text-sm text-ink-muted">
            every {row.original.cadence?.everyHours ?? '—'}h
          </span>
        ),
      },
      {
        id: 'nextRunAt',
        header: 'Next run',
        cell: ({ row }) => (
          <span className="text-sm text-ink-muted">{formatWhen(row.original.nextRunAt)}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge tone={statusTone(row.original.status)}>{row.original.status}</StatusBadge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        compact
        title={PAGE_COPY.discoveryPlans.title}
        description={PAGE_COPY.discoveryPlans.description}
        actions={
          <div className="hidden flex-wrap gap-2 sm:flex">
            <Button asChild variant="secondary" size="sm">
              <Link href="/discovery">Discovery runs</Link>
            </Button>
            <Button size="sm" onClick={() => setWizardOpen(true)}>
              Create plan
            </Button>
          </div>
        }
      />

      <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-ink-muted">
            Search plans
            <Input
              value={draftQuery}
              placeholder="Name or description…"
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
              className="h-9 w-full min-w-36 rounded-md border border-line bg-surface px-3 text-sm text-ink"
              value={statusFilter}
              onChange={(event) => {
                update({
                  filters: { ...state.filters, status: event.target.value },
                  resetPage: true,
                });
                setActiveViewId(null);
              }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-muted">
            Type
            <select
              className="h-9 w-full min-w-36 rounded-md border border-line bg-surface px-3 text-sm text-ink"
              value={planTypeFilter}
              onChange={(event) => {
                update({
                  filters: { ...state.filters, planType: event.target.value },
                  resetPage: true,
                });
                setActiveViewId(null);
              }}
            >
              <option value="">All types</option>
              <option value="discovery">Discovery</option>
              <option value="monitor">Monitor</option>
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
          surface="discovery_plans"
          currentDefinition={currentDefinition}
          activeViewId={activeViewId}
          onApply={applySavedView}
          onActiveViewChange={setActiveViewId}
          productPresets={PLAN_PRESETS}
        />
      </div>

      {error ? (
        <ErrorState title="Could not load plans" description={error} onRetry={() => void load()} />
      ) : (
        <DataTable
          data={items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={loading}
          emptyTitle={hasFilters ? 'No plans match these filters' : 'No discovery plans yet'}
          emptyDescription={
            hasFilters
              ? 'Clear filters or create a new schedule.'
              : 'Create a plan with the guided editor. The worker enqueues runs on cadence while you triage the Queue.'
          }
          emptyAction={
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
            ) : (
              <Button size="sm" onClick={() => setWizardOpen(true)}>
                Create plan
              </Button>
            )
          }
          onRowInspect={(row) => {
            setInspectedId(row.id);
            setInspectorOpen(true);
          }}
          onRowActivate={(row) => router.push(`/discovery/plans/${row.id}`)}
          focusedRowId={inspectedId}
        />
      )}

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>
          {total} plan{total === 1 ? '' : 's'}
          {state.page > 1 ? ` · page ${state.page}` : ''}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={state.page <= 1 || loading}
            onClick={() => update({ page: state.page - 1 })}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={items.length < state.limit || loading}
            onClick={() => update({ page: state.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>

      <InspectorDrawer
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        title="Plan inspector"
        description="Schedule, targets, and next actions without leaving the list."
        footer={
          inspected ? (
            <PlanInspectorActions
              plan={inspected}
              busy={busyId === inspected.id}
              onRunNow={() => void runNow(inspected.id)}
              onPause={() => void patchStatus(inspected.id, 'paused')}
              onResume={() => void patchStatus(inspected.id, 'active')}
              onArchive={() => void patchStatus(inspected.id, 'archived')}
            />
          ) : undefined
        }
      >
        <PlanInspector
          plan={inspected}
          busy={busyId === inspected?.id}
          hideActions
          onRunNow={() => inspected && void runNow(inspected.id)}
          onPause={() => inspected && void patchStatus(inspected.id, 'paused')}
          onResume={() => inspected && void patchStatus(inspected.id, 'active')}
          onArchive={() => inspected && void patchStatus(inspected.id, 'archived')}
        />
      </InspectorDrawer>

      <PlanEditorWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        options={options}
        onCreated={(id) => {
          void load();
          router.push(`/discovery/plans/${id}`);
        }}
      />

      {!loading && items.length > 0 && (
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 py-3 shadow-panel backdrop-blur">
          <span className="text-sm text-ink-muted">
            {total} plan{total === 1 ? '' : 's'}
            {state.page > 1 ? ` · page ${state.page}` : ''}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/discovery">Discovery runs</Link>
            </Button>
            <Button size="sm" onClick={() => setWizardOpen(true)}>
              Create plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
