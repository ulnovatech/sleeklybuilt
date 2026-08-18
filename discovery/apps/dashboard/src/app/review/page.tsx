'use client';

import { canPromoteFromReview } from '@agency/qualification/review-verification';
import type { OpportunityType } from '@agency/scoring';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import {
  defaultDemandDraft,
  type DemandProspectDraft,
} from '@/components/opportunities/demand-work-card';
import type { OpportunityCardItem } from '@/components/opportunities/opportunity-card';
import {
  QueueInspector,
  QueueInspectorActions,
  type QueueInspectorTarget,
} from '@/components/operator/queue-inspector';
import {
  SavedViewsControl,
  type ProductSavedView,
  type SavedView,
  type SavedViewDefinition,
} from '@/components/operator/saved-views-control';
import { DataTable } from '@/components/ui/data-table';
import {
  BulkActionButton,
  BulkSelectionBar,
  selectColumnDef,
} from '@/components/ui/bulk-selection';
import {
  Button,
  CollapsibleSection,
  Dialog,
  ErrorState,
  Input,
  InspectorDrawer,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { Ban, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import { useListView } from '@/lib/use-list-view';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

type Reachability = 'high' | 'medium' | 'low' | 'none';
type VerificationFilter = 'verified' | 'unverified' | 'all';
type KindFilter = 'all' | 'demand' | 'opportunity';

export type WhatsAppScreening = {
  status: 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked';
  reason: string;
  waMeUrl: string | null;
  normalizedPhone: string | null;
};

type WorkQueueDemand = {
  kind: 'demand';
  priority: number;
  tier: 'demand';
  tierLabel: string;
  demand: {
    id: string;
    source: string;
    signalType: string;
    signalStrength: number;
    title: string | null;
    snippet: string | null;
    sourceUrl: string | null;
    capturedAt: string;
  };
};

type WorkQueueOpportunity = {
  kind: 'opportunity';
  priority: number;
  tier: 'verified_opportunity' | 'unverified_opportunity';
  tierLabel: string;
  opportunity: OpportunityCardItem & {
    factors: Record<string, number>;
    acquisitionLane?: string;
    whatsapp?: WhatsAppScreening;
  };
};

type WorkQueueEntry = WorkQueueDemand | WorkQueueOpportunity;

type WorkQueueResponse = {
  items: WorkQueueEntry[];
  total: number;
  page: number;
  limit: number;
  nextCursor?: string | null;
  hasMore?: boolean;
  presenceRefined?: boolean;
  counts: {
    demand: number;
    opportunity: number;
    verifiedOpportunity: number;
    unverifiedOpportunity: number;
  };
};

type BulkResponse = {
  requested: number;
  succeeded: number;
  failed: number;
  results: Array<{ id: string; ok: boolean; error?: string }>;
};

const REACHABILITY_ORDER: Reachability[] = ['high', 'medium', 'low', 'none'];

const PRODUCT_QUEUE_VIEWS: ProductSavedView[] = [
  {
    id: 'preset:greenfield',
    name: 'Greenfield',
    definition: {
      filters: { kind: 'all', acquisitionLane: 'greenfield', verification: 'all' },
      sort: 'priority',
      direction: 'desc',
      density: 'compact',
    },
  },
  {
    id: 'preset:hot-demand',
    name: 'Hot demand',
    definition: {
      filters: { kind: 'demand', acquisitionLane: 'all', verification: 'all' },
      sort: 'priority',
      direction: 'desc',
      density: 'compact',
    },
  },
  {
    id: 'preset:whatsapp-ready',
    name: 'Phone on file (WhatsApp screen)',
    definition: {
      filters: {
        kind: 'opportunity',
        acquisitionLane: 'greenfield',
        hasPhone: '1',
        verification: 'all',
      },
      sort: 'priority',
      direction: 'desc',
      density: 'compact',
    },
  },
  {
    id: 'preset:redesign',
    name: 'Redesign lane',
    definition: {
      filters: { kind: 'opportunity', acquisitionLane: 'redesign', verification: 'all' },
      sort: 'priority',
      direction: 'desc',
      density: 'compact',
    },
  },
];

function entryId(entry: WorkQueueEntry): string {
  return entry.kind === 'demand' ? `demand:${entry.demand.id}` : `opp:${entry.opportunity.account.id}`;
}

export default function WorkQueuePage() {
  return (
    <Suspense fallback={<WorkQueueSkeleton />}>
      <WorkQueuePageContent />
    </Suspense>
  );
}

function WorkQueuePageContent() {
  const { state, update, clearFilters, toQueryString } = useListView({
    sort: 'priority',
    direction: 'desc',
    limit: 50,
  });
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [entries, setEntries] = useState<WorkQueueEntry[]>([]);
  const [counts, setCounts] = useState<WorkQueueResponse['counts'] | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [presenceRefined, setPresenceRefined] = useState(false);
  const [loading, setLoading] = useState<string | null>('queue');
  const [error, setError] = useState<string | null>(null);
  const [demandDrafts, setDemandDrafts] = useState<Record<string, DemandProspectDraft>>({});
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [selectionResetToken, setSelectionResetToken] = useState(0);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<'dismiss' | 'reject' | null>(null);
  const [bulkPending, setBulkPending] = useState(false);
  const [promoteBlockedReason, setPromoteBlockedReason] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const router = useRouter();
  const { push } = useToast();

  const filters = {
    kind: (state.filters.kind as KindFilter) || 'all',
    minScore: state.filters.minScore ?? '',
    reachability: (state.filters.reachability as '' | Reachability) || '',
    runId: state.filters.runId ?? '',
    verification: (state.filters.verification as VerificationFilter) || 'all',
    opportunityType: (state.filters.opportunityType as '' | OpportunityType) || '',
    acquisitionLane: state.filters.acquisitionLane ?? 'greenfield',
    hasPhone: state.filters.hasPhone ?? '',
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.q.trim()) count++;
    if (filters.kind !== 'all') count++;
    if (filters.verification !== 'all') count++;
    if (filters.opportunityType) count++;
    if (filters.acquisitionLane !== 'greenfield') count++;
    if (filters.hasPhone) count++;
    if (filters.reachability) count++;
    if (filters.minScore) count++;
    if (filters.runId) count++;
    return count;
  }, [state.q, filters]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setFiltersOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const queryPath = useMemo(() => {
    const params = new URLSearchParams(toQueryString());
    if (!params.get('kind')) params.set('kind', 'all');
    if (!params.get('verification')) params.set('verification', 'all');
    if (!params.get('acquisitionLane') && !params.get('hasPhone')) {
      params.set('acquisitionLane', 'greenfield');
    }
    return `/api/qualification/work-queue?${params.toString()}`;
  }, [toQueryString]);

  const currentDefinition = useMemo<SavedViewDefinition>(
    () => ({
      filters: {
        ...state.filters,
        ...(state.q ? { q: state.q } : {}),
      },
      sort: state.sort,
      direction: state.direction,
      density: state.density,
    }),
    [state.density, state.direction, state.filters, state.q, state.sort],
  );

  const load = useCallback(async () => {
    setLoading('queue');
    setError(null);
    try {
      const data = await api<WorkQueueResponse>(queryPath);
      setEntries(data.items);
      setTotal(data.total);
      setCounts(data.counts);
      setHasMore(Boolean(data.hasMore));
      setPresenceRefined(Boolean(data.presenceRefined));
      setSelectedAccountIds(new Set());
      setSelectionResetToken((token) => token + 1);
      setFocusIndex(0);
      setDemandDrafts((prev) => {
        const next = { ...prev };
        for (const entry of data.items) {
          if (entry.kind === 'demand' && !next[entry.demand.id]) {
            next[entry.demand.id] = defaultDemandDraft(entry.demand);
          }
        }
        return next;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load work queue');
    } finally {
      setLoading(null);
    }
  }, [queryPath]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = (key: string, value: string) => {
    update({
      filters: { ...state.filters, [key]: value },
      resetPage: true,
    });
    setActiveViewId(null);
  };

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

  const focusedEntry = entries[focusIndex] ?? null;
  const focusedRowId = focusedEntry ? entryId(focusedEntry) : null;

  const inspectedEntry = useMemo(() => {
    if (!inspectedId) return null;
    return entries.find((entry) => entryId(entry) === inspectedId) ?? null;
  }, [entries, inspectedId]);

  const inspectorTarget = useMemo<QueueInspectorTarget | null>(() => {
    if (!inspectedEntry) return null;
    if (inspectedEntry.kind === 'demand') {
      return {
        kind: 'demand',
        tierLabel: inspectedEntry.tierLabel,
        priority: inspectedEntry.priority,
        demand: inspectedEntry.demand,
        draft: demandDrafts[inspectedEntry.demand.id] ?? defaultDemandDraft(inspectedEntry.demand),
      };
    }
    const item = inspectedEntry.opportunity;
    const promote = canPromoteFromReview({
      verified: item.verified,
      reachability: item.reachability,
      hasEmail: !!item.business.email,
      hasPhone: !!item.business.phone,
    });
    return {
      kind: 'opportunity',
      tierLabel: inspectedEntry.tierLabel,
      priority: inspectedEntry.priority,
      opportunity: item,
      promoteAllowed: promote.allowed,
      promoteBlocked: promote.allowed ? undefined : promote.reason,
    };
  }, [demandDrafts, inspectedEntry]);

  const openInspect = (entry: WorkQueueEntry) => {
    const index = entries.findIndex((row) => entryId(row) === entryId(entry));
    if (index >= 0) setFocusIndex(index);
    setInspectedId(entryId(entry));
    setInspectorOpen(true);
  };

  const accept = async (item: OpportunityCardItem) => {
    const promote = canPromoteFromReview({
      verified: item.verified,
      reachability: item.reachability,
      hasEmail: !!item.business.email,
      hasPhone: !!item.business.phone,
    });
    if (!promote.allowed) {
      setPromoteBlockedReason(promote.reason ?? 'This opportunity cannot be promoted yet.');
      return;
    }

    setLoading(item.business.id);
    setError(null);
    try {
      const { lead } = await api<{ lead: { id: string } }>('/api/crm/leads', {
        method: 'POST',
        body: JSON.stringify({ businessId: item.business.id, promoteOnly: true }),
      });
      push({
        tone: 'success',
        title: 'Pursuit started',
        description: 'Pick a channel in Outreach Queue to generate a pitch from the Case File.',
      });
      router.push(`/outreach?selected=${encodeURIComponent(lead.id)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Start pursuit failed');
    } finally {
      setLoading(null);
    }
  };

  const dismissOpportunity = async (accountId: string) => {
    setLoading(accountId);
    setError(null);
    try {
      await api(`/api/qualification/review-queue/${accountId}/dismiss`, { method: 'POST' });
      setInspectorOpen(false);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Dismiss failed');
    } finally {
      setLoading(null);
    }
  };

  const rejectOpportunity = (accountId: string) => {
    setSelectedAccountIds(new Set([accountId]));
    setBulkAction('reject');
  };

  const runBulk = async () => {
    if (!bulkAction || selectedAccountIds.size === 0) return;
    setBulkPending(true);
    setError(null);
    try {
      const result = await api<BulkResponse>('/api/qualification/review-queue/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: bulkAction,
          accountIds: [...selectedAccountIds],
          idempotencyKey: crypto.randomUUID(),
          reason: bulkAction === 'reject' ? 'Rejected from work queue' : undefined,
        }),
      });
      setBulkAction(null);
      if (result.failed > 0) {
        setError(
          `Bulk ${bulkAction}: ${result.succeeded} succeeded, ${result.failed} failed of ${result.requested}.`,
        );
      }
      setInspectorOpen(false);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Bulk ${bulkAction} failed`);
    } finally {
      setBulkPending(false);
    }
  };

  const dismissDemand = async (signalId: string) => {
    setLoading(signalId);
    setError(null);
    try {
      await api(`/api/intent/demand-inbox/${signalId}/dismiss`, { method: 'POST' });
      setInspectorOpen(false);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Dismiss failed');
    } finally {
      setLoading(null);
    }
  };

  const createProspect = async (signalId: string) => {
    const draft = demandDrafts[signalId];
    if (!draft?.name.trim()) {
      setError('Business name is required to create a prospect');
      return;
    }
    setLoading(`create-${signalId}`);
    setError(null);
    try {
      await api(`/api/intent/demand-inbox/${signalId}/create-prospect`, {
        method: 'POST',
        body: JSON.stringify({
          name: draft.name.trim(),
          city: draft.city.trim() || undefined,
          country: draft.country.trim() || undefined,
          industry: draft.industry.trim() || undefined,
        }),
      });
      setInspectorOpen(false);
      await load();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Create prospect failed');
    } finally {
      setLoading(null);
    }
  };

  const matchDemand = async (signalId: string) => {
    const businessId = demandDrafts[signalId]?.businessId.trim();
    if (!businessId) {
      setError('Business ID is required to match');
      return;
    }
    setLoading(`match-${signalId}`);
    setError(null);
    try {
      await api(`/api/intent/demand-inbox/${signalId}/match`, {
        method: 'POST',
        body: JSON.stringify({ businessId }),
      });
      setInspectorOpen(false);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Match failed');
    } finally {
      setLoading(null);
    }
  };

  const runFocusedAction = useCallback(
    (action: 'promote' | 'dismiss' | 'suppress' | 'inspect') => {
      const entry = entries[focusIndex];
      if (!entry) return;
      if (action === 'inspect') {
        openInspect(entry);
        return;
      }
      if (entry.kind === 'demand') {
        if (action === 'dismiss') void dismissDemand(entry.demand.id);
        return;
      }
      if (action === 'promote') void accept(entry.opportunity);
      if (action === 'dismiss') void dismissOpportunity(entry.opportunity.account.id);
      if (action === 'suppress') rejectOpportunity(entry.opportunity.account.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, focusIndex],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      if (event.key === 'j') {
        event.preventDefault();
        setFocusIndex((index) => Math.min(entries.length - 1, index + 1));
      } else if (event.key === 'k') {
        event.preventDefault();
        setFocusIndex((index) => Math.max(0, index - 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runFocusedAction('inspect');
      } else if (event.key === 'p') {
        event.preventDefault();
        runFocusedAction('promote');
      } else if (event.key === 'd') {
        event.preventDefault();
        runFocusedAction('dismiss');
      } else if (event.key === 'x') {
        event.preventDefault();
        runFocusedAction('suppress');
      } else if (event.key === 'Escape') {
        setInspectorOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [entries.length, runFocusedAction]);

  const columns = useMemo<ColumnDef<WorkQueueEntry, unknown>[]>(
    () => [
      selectColumnDef<WorkQueueEntry>({
        headerAriaLabel: 'Select page opportunities',
        isRowSelectable: (row) => row.kind === 'opportunity',
        getRowLabel: (row) =>
          row.kind === 'opportunity' ? row.opportunity.business.name : 'demand signal',
      }),
      {
        id: 'identity',
        header: 'Identity',
        cell: ({ row }) => {
          if (row.original.kind === 'demand') {
            return (
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {row.original.demand.title || 'Untitled demand'}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {row.original.demand.source} · {row.original.demand.signalType}
                </p>
              </div>
            );
          }
          const item = row.original.opportunity;
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{item.business.name}</p>
              <p className="truncate text-xs text-ink-muted">
                {[item.business.city, item.run.industry].filter(Boolean).join(' · ')}
              </p>
            </div>
          );
        },
        size: 220,
      },
      {
        id: 'lane',
        header: 'Lane',
        cell: ({ row }) => {
          if (row.original.kind === 'demand') {
            return <StatusBadge tone="warning">Hot demand</StatusBadge>;
          }
          const type = row.original.opportunity.opportunityType;
          const tone =
            type === 'greenfield' || type === 'demand_response'
              ? 'success'
              : type === 'redesign' || type === 'modernize'
                ? 'info'
                : 'neutral';
          return (
            <StatusBadge tone={tone}>{row.original.opportunity.opportunityTypeLabel}</StatusBadge>
          );
        },
        size: 140,
      },
      {
        id: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <div>
            <p className="font-medium tabular-nums text-ink">{row.original.priority}</p>
            <p className="text-xs text-ink-muted">{row.original.tierLabel}</p>
          </div>
        ),
        size: 110,
      },
      {
        id: 'reach',
        header: 'Reach / score',
        cell: ({ row }) => {
          if (row.original.kind === 'demand') {
            return (
              <span className="text-sm text-ink-muted">
                Strength {row.original.demand.signalStrength}
              </span>
            );
          }
          const item = row.original.opportunity;
          return (
            <div>
              <p className="capitalize text-ink">{item.reachability}</p>
              <p className="text-xs text-ink-muted">
                Score {item.score}
                {item.business.phone ? ' · WA phone' : ''}
                {item.verified ? ' · verified' : ''}
              </p>
            </div>
          );
        },
        size: 140,
      },
      {
        id: 'next',
        header: 'Next',
        cell: ({ row }) => {
          if (row.original.kind === 'demand') {
            return <span className="text-xs text-ink-muted">Create or match prospect</span>;
          }
          const item = row.original.opportunity;
          const promote = canPromoteFromReview({
            verified: item.verified,
            reachability: item.reachability,
            hasEmail: !!item.business.email,
            hasPhone: !!item.business.phone,
          });
          return (
            <span className={cn('text-xs', promote.allowed ? 'text-success' : 'text-ink-muted')}>
              {promote.allowed ? 'Start pursuit' : promote.reason ?? 'Needs contact'}
            </span>
          );
        },
        size: 160,
      },
    ],
    [],
  );

  const selectedCount = selectedAccountIds.size;
  const totalPages = Math.max(1, Math.ceil(total / state.limit));
  const isLoadingQueue = loading === 'queue';
  const actionBusy = Boolean(loading && loading !== 'queue');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader compact title={PAGE_COPY.workQueue.title} description={PAGE_COPY.workQueue.description} />
        <div className="flex flex-wrap gap-2">
          {filters.runId && (
            <div className="inline-flex items-center gap-2 rounded-full bg-info-muted px-2 py-1 text-[11px] font-medium text-info-foreground ring-1 ring-info/20">
              Run scope · {filters.runId.slice(0, 8)}…
              <button type="button" className="underline" onClick={() => setFilter('runId', '')}>
                Clear
              </button>
            </div>
          )}
          <Button size="sm" variant="secondary" asChild>
            <Link href="/intent">Capture demand</Link>
          </Button>
        </div>
      </div>

      {error && (
        <ErrorState title="Work queue issue" description={error} onRetry={() => void load()} />
      )}

      {counts && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-warning-muted px-2 py-1 text-warning-foreground">
            {counts.demand} hot demand
          </span>
          <span className="rounded bg-success-muted px-2 py-1 text-success-foreground">
            {counts.opportunity} opportunities in scope
          </span>
          <span className="rounded bg-surface-raised px-2 py-1 text-ink-muted">
            {total} matching · page {state.page}/{totalPages}
            {hasMore ? ' · more available' : ''}
          </span>
          {presenceRefined && (
            <span className="rounded bg-info-muted px-2 py-1 text-info-foreground">
              {entries.length} shown after presence filter (applies to this page)
            </span>
          )}
        </div>
      )}

      <div className="rounded-lg border border-line bg-surface p-4">
        <CollapsibleSection
          id="queue-filters"
          title={`Filters & views${activeFilterCount ? ` · ${activeFilterCount} active` : ''}`}
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        >
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-ink-muted">
                Search
                <Input
                  value={draftQuery}
                  placeholder="Business, city, email, phone, industry…"
                  onChange={(event) => setDraftQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      update({ q: draftQuery.trim(), resetPage: true });
                      setActiveViewId(null);
                    }
                  }}
                />
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    update({ q: draftQuery.trim(), resetPage: true });
                    setActiveViewId(null);
                  }}
                >
                  Apply search
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraftQuery('');
                    clearFilters();
                    setActiveViewId(null);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>

            <SavedViewsControl
              surface="work_queue"
              currentDefinition={currentDefinition}
              activeViewId={activeViewId}
              onApply={applySavedView}
              onActiveViewChange={setActiveViewId}
              productPresets={PRODUCT_QUEUE_VIEWS}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <FilterSelect
                label="Show"
                value={filters.kind}
                onChange={(value) => setFilter('kind', value)}
                options={[
                  { value: 'all', label: 'All (priority sorted)' },
                  { value: 'demand', label: 'Hot demand only' },
                  { value: 'opportunity', label: 'Opportunities only' },
                ]}
              />
              <FilterSelect
                label="Verification"
                value={filters.verification}
                onChange={(value) => setFilter('verification', value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'verified', label: 'Verified only' },
                  { value: 'unverified', label: 'Unverified only' },
                ]}
              />
              <FilterSelect
                label="Presence (this page)"
                value={filters.opportunityType}
                onChange={(value) => setFilter('opportunityType', value)}
                options={[
                  { value: '', label: 'All types' },
                  { value: 'demand_response', label: 'Demand response' },
                  { value: 'greenfield', label: 'Greenfield site' },
                  { value: 'redesign', label: 'Redesign' },
                  { value: 'modernize', label: 'Modernize' },
                  { value: 'general', label: 'General fit' },
                ]}
              />
              <FilterSelect
                label="Acquisition lane"
                value={filters.acquisitionLane}
                onChange={(value) => setFilter('acquisitionLane', value)}
                options={[
                  { value: 'greenfield', label: 'Greenfield (default)' },
                  { value: 'redesign', label: 'Redesign' },
                  { value: 'all', label: 'All lanes' },
                ]}
              />
              <FilterSelect
                label="Phone channel"
                value={filters.hasPhone}
                onChange={(value) => setFilter('hasPhone', value)}
                options={[
                  { value: '', label: 'Any' },
                  { value: '1', label: 'Phone on file' },
                ]}
              />
              <FilterSelect
                label="Reachability"
                value={filters.reachability}
                onChange={(value) => setFilter('reachability', value)}
                options={[
                  { value: '', label: 'All' },
                  ...REACHABILITY_ORDER.map((level) => ({
                    value: level,
                    label: level.charAt(0).toUpperCase() + level.slice(1),
                  })),
                ]}
              />
            </div>
            <p className="text-xs text-ink-muted">
              Keyboard triage: j/k move · Enter inspect · p promote · d dismiss · x suppress
            </p>
          </div>
        </CollapsibleSection>
      </div>

      <BulkSelectionBar
        count={selectedCount}
        noun="opportunity"
        pluralNoun="opportunities"
        onClear={() => {
          setSelectedAccountIds(new Set());
          setSelectionResetToken((token) => token + 1);
        }}
      >
        <BulkActionButton icon={XCircle} label="Dismiss selected" onClick={() => setBulkAction('dismiss')}>
          Dismiss selected
        </BulkActionButton>
        <BulkActionButton
          icon={Ban}
          label="Suppress selected"
          variant="danger"
          onClick={() => setBulkAction('reject')}
        >
          Suppress selected
        </BulkActionButton>
      </BulkSelectionBar>

      <DataTable
        data={entries}
        columns={columns}
        getRowId={(row) => entryId(row)}
        isLoading={isLoadingQueue}
        error={error && entries.length === 0 ? new Error(error) : null}
        onRetry={() => void load()}
        focusedRowId={focusedRowId}
        selectionResetToken={selectionResetToken}
        onSelectionChange={(ids) => {
          const accountIds = ids
            .filter((id) => id.startsWith('opp:'))
            .map((id) => id.slice(4));
          setSelectedAccountIds(new Set(accountIds));
        }}
        onRowActivate={(row) => {
          const index = entries.findIndex((entry) => entryId(entry) === entryId(row));
          if (index >= 0) setFocusIndex(index);
        }}
        onRowInspect={openInspect}
        emptyTitle="Work queue is clear"
        emptyDescription={
          filters.runId
            ? 'No triage items match this discovery run and filters. Clear the run scope or widen filters.'
            : 'Run discovery or add demand signals to refill this queue.'
        }
        emptyAction={
          <Button size="sm" asChild>
            <Link href={filters.runId ? `/discovery/${filters.runId}` : '/intent'}>
              {filters.runId ? 'Open discovery run' : 'Add demand'}
            </Link>
          </Button>
        }
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            disabled={state.page <= 1}
            onClick={() => update({ page: state.page - 1 })}
          >
            Previous
          </Button>
          <Button
            size="sm"
            disabled={state.page >= totalPages}
            onClick={() => update({ page: state.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      <InspectorDrawer
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        title={
          inspectorTarget?.kind === 'demand'
            ? 'Demand signal'
            : inspectorTarget?.opportunity.business.name ?? 'Inspect'
        }
        description="Evidence stays beside the triage decision. Promote opens the lead Pitch Pack."
        footer={
          inspectorTarget ? (
            <QueueInspectorActions
              target={inspectorTarget}
              loading={actionBusy}
              onStartPursuit={() => {
                if (inspectorTarget?.kind === 'opportunity') {
                  void accept(inspectorTarget.opportunity);
                }
              }}
              onDismissOpportunity={() => {
                if (inspectorTarget?.kind === 'opportunity') {
                  void dismissOpportunity(inspectorTarget.opportunity.account.id);
                }
              }}
              onSuppressOpportunity={() => {
                if (inspectorTarget?.kind === 'opportunity') {
                  rejectOpportunity(inspectorTarget.opportunity.account.id);
                }
              }}
              onCreateProspect={() => {
                if (inspectorTarget?.kind === 'demand') void createProspect(inspectorTarget.demand.id);
              }}
              onMatchDemand={() => {
                if (inspectorTarget?.kind === 'demand') void matchDemand(inspectorTarget.demand.id);
              }}
              onDismissDemand={() => {
                if (inspectorTarget?.kind === 'demand') void dismissDemand(inspectorTarget.demand.id);
              }}
            />
          ) : undefined
        }
      >
        <QueueInspector
          target={inspectorTarget}
          loading={actionBusy}
          onDraftChange={(draft) => {
            if (inspectorTarget?.kind !== 'demand') return;
            setDemandDrafts((prev) => ({ ...prev, [inspectorTarget.demand.id]: draft }));
          }}
        />
      </InspectorDrawer>

      <Dialog
        open={bulkAction !== null}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
        }}
        title={bulkAction === 'reject' ? 'Suppress selected accounts?' : 'Dismiss selected opportunities?'}
        description={
          bulkAction === 'reject'
            ? `This will suppress ${selectedCount} account${selectedCount === 1 ? '' : 's'} from future queues. Partial failures are reported per row.`
            : `This will dismiss ${selectedCount} opportunit${selectedCount === 1 ? 'y' : 'ies'} from the review queue.`
        }
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setBulkAction(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={bulkAction === 'reject' ? 'danger' : 'primary'}
            loading={bulkPending}
            onClick={() => void runBulk()}
          >
            {bulkAction === 'reject' ? 'Suppress' : 'Dismiss'}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={promoteBlockedReason !== null}
        onOpenChange={(open) => {
          if (!open) setPromoteBlockedReason(null);
        }}
        title="Cannot start pursuit"
        description={promoteBlockedReason ?? ''}
      >
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => setPromoteBlockedReason(null)}>
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-1 text-xs font-medium text-ink-muted">
      {label}
      <select
        className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value || 'empty'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function WorkQueueSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
