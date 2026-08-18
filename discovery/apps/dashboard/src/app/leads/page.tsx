'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import {
  SavedViewsControl,
  type ProductSavedView,
  type SavedView,
  type SavedViewDefinition,
} from '@/components/operator/saved-views-control';
import {
  BulkActionButton,
  BulkSelectionBar,
  selectColumnDef,
} from '@/components/ui/bulk-selection';
import { DataTable } from '@/components/ui/data-table';
import {
  Button,
  CollapsibleSection,
  Dialog,
  ErrorState,
  Input,
  StatusBadge,
} from '@/components/ui/primitives';
import { Archive, CheckCircle2, Send } from 'lucide-react';
import { useApiQuery } from '@/lib/use-api-query';
import { useListView } from '@/lib/use-list-view';
import { DumpsterWorkspace } from '@/components/ops/dumpster-workspace';
import { PitchTodayYieldBanner } from '@/components/ops/pitch-today-card';
import {
  PitchOverlayDrawer,
  recommendedChannelToDraft,
} from '@/components/pursuit/pitch-overlay-drawer';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import {
  fetchUnpitchedKeepers,
  isUnpitchedStatus,
  nextKeeperInList,
  nextUnpitchedLeadId,
  prevKeeperInList,
} from '@/lib/pitch-session';
import { LEAD_STATUSES } from '@agency/types';
import { useToast } from '@/components/ui/toast';

type LeadRow = {
  lead: { id: string; status: string; priority: string; updatedAt?: string; nextFollowUpAt?: string | null };
  business: { name: string; city: string | null };
  factory?: { rank: number | null; recommendedChannel: string | null; memberId: string };
};

type LeadsListResponse = {
  items: LeadRow[];
  leads: LeadRow[];
  total: number;
  page: number;
  limit: number;
  ownerScope: string;
};

const PIPELINE_PRESETS: ProductSavedView[] = [
  {
    id: 'preset:pitch-today',
    name: 'Pitch today',
    definition: {
      filters: { pitchToday: '1' },
      sort: 'rank',
      direction: 'asc',
      density: 'compact',
    },
  },
  {
    id: 'preset:active',
    name: 'Active pursuits',
    definition: {
      filters: {},
      sort: 'updatedAt',
      direction: 'desc',
      density: 'compact',
    },
  },
  {
    id: 'preset:contacted',
    name: 'Contacted',
    definition: {
      filters: { status: 'CONTACTED' },
      sort: 'nextFollowUpAt',
      direction: 'asc',
      density: 'compact',
    },
  },
  {
    id: 'preset:qualified',
    name: 'Qualified',
    definition: {
      filters: { status: 'QUALIFIED' },
      sort: 'updatedAt',
      direction: 'desc',
      density: 'compact',
    },
  },
];

function statusTone(status: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'CONTACTED' || status === 'PROPOSAL_SENT') return 'info';
  if (status === 'QUALIFIED' || status === 'REPLIED') return 'success';
  if (status === 'NO_RESPONSE') return 'warning';
  if (status === 'CLOSED_LOST' || status === 'ARCHIVED') return 'danger';
  return 'neutral';
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsGate />
    </Suspense>
  );
}

function LeadsGate() {
  const searchParams = useSearchParams();
  const dumpster = searchParams.get('dumpster');
  if (dumpster === '1' || dumpster === 'true') return <DumpsterWorkspace />;
  return <LeadsPageContent />;
}

function LeadsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, update, clearFilters, toQueryString } = useListView({
    sort: 'updatedAt',
    direction: 'desc',
    limit: 20,
  });
  const selectedId = searchParams.get('selected') ?? '';
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionResetToken, setSelectionResetToken] = useState(0);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [bulkPushOpen, setBulkPushOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { push } = useToast();

  const path = useMemo(() => `/api/crm/leads?${toQueryString()}`, [toQueryString]);
  const { data, error, isLoading, refresh } = useApiQuery<LeadsListResponse>(path);

  const items = data?.items ?? data?.leads ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / state.limit));
  const pitchToday = state.filters.pitchToday === '1' || state.filters.pitchToday === 'true';
  const hasActiveFilters = Boolean(
    state.q || state.filters.status || state.filters.priority || pitchToday || state.filters.sellDate,
  );

  const setSelected = useCallback(
    (leadId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (leadId) params.set('selected', leadId);
      else params.delete('selected');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectedRow = useMemo(
    () => items.find((row) => row.lead.id === selectedId) ?? null,
    [items, selectedId],
  );

  const handlePitchRecorded = useCallback(async () => {
    if (!selectedId) return;
    const currentRank = selectedRow?.factory?.rank;
    await refresh();
    try {
      const unpitched = await fetchUnpitchedKeepers(state.filters.sellDate);
      const nextId = nextUnpitchedLeadId(unpitched, selectedId, currentRank);
      setSelected(nextId ?? '');
    } catch {
      // List refresh still applied; operator can pick the next row manually.
    }
  }, [refresh, selectedId, selectedRow?.factory?.rank, setSelected, state.filters.sellDate]);

  useEffect(() => {
    if (!pitchToday || !items.length || selectedId) return;
    const firstUnpitched = items.find((row) => isUnpitchedStatus(row.lead.status));
    if (firstUnpitched) setSelected(firstUnpitched.lead.id);
  }, [items, pitchToday, selectedId, setSelected]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.q.trim()) count++;
    if (state.filters.status) count++;
    if (state.filters.priority) count++;
    if (pitchToday) count++;
    return count;
  }, [pitchToday, state.filters.priority, state.filters.status, state.q]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setFiltersOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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

  const applySavedView = (view: SavedView) => {
    const nextFilters = { ...view.definition.filters };
    const q = nextFilters.q ?? '';
    delete nextFilters.q;
    for (const key of ['status', 'priority', 'followUpDue', 'pitchToday', 'sellDate', 'dumpster']) {
      if (!(key in nextFilters)) nextFilters[key] = '';
    }
    const pitchTodayView = nextFilters.pitchToday === '1' || nextFilters.pitchToday === 'true';
    setDraftQuery(q);
    setActiveViewId(view.id);
    update({
      q,
      sort: view.definition.sort ?? state.sort,
      direction: view.definition.direction ?? state.direction,
      density: view.definition.density ?? state.density,
      limit: pitchTodayView ? 100 : state.limit,
      filters: nextFilters,
      page: 1,
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionResetToken((token) => token + 1);
  };

  const runBulkTransition = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      const result = await api<{ succeeded: number; failed: number; requested: number }>(
        '/api/crm/leads/bulk',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'transition',
            leadIds: [...selectedIds],
            toStatus: bulkStatus,
            idempotencyKey: crypto.randomUUID(),
          }),
        },
      );
      setBulkStatus(null);
      clearSelection();
      push({
        tone: result.failed > 0 ? 'info' : 'success',
        title: 'Bulk transition finished',
        description: `${result.succeeded} succeeded, ${result.failed} failed of ${result.requested}.`,
      });
      await refresh();
    } catch (reason) {
      push({
        tone: 'error',
        title: 'Bulk transition failed',
        description: reason instanceof Error ? reason.message : 'Request failed',
      });
    } finally {
      setBulkPending(false);
    }
  };

  const runBulkPushCrm = async () => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      const result = await api<{ succeeded: number; failed: number; requested: number }>(
        '/api/crm/leads/bulk-push-sleekly-dash',
        {
          method: 'POST',
          body: JSON.stringify({
            leadIds: [...selectedIds],
            idempotencyKey: crypto.randomUUID(),
          }),
        },
      );
      setBulkPushOpen(false);
      clearSelection();
      push({
        tone: result.failed > 0 ? 'info' : 'success',
        title: 'CRM push finished',
        description: `${result.succeeded} sent, ${result.failed} failed of ${result.requested}.`,
      });
      await refresh();
    } catch (reason) {
      push({
        tone: 'error',
        title: 'CRM push failed',
        description: reason instanceof Error ? reason.message : 'Request failed',
      });
    } finally {
      setBulkPending(false);
    }
  };

  const columns = useMemo<ColumnDef<LeadRow, unknown>[]>(
    () => [
      selectColumnDef<LeadRow>({
        headerAriaLabel: 'Select all pursuits on this page',
        getRowLabel: (row) => row.business.name,
      }),
      ...(pitchToday
        ? [
            {
              id: 'rank',
              header: '#',
              cell: ({ row }: { row: { original: LeadRow } }) => (
                <span className="tabular-nums text-sm text-ink-muted">
                  {row.original.factory?.rank ?? '—'}
                </span>
              ),
              size: 48,
            } satisfies ColumnDef<LeadRow, unknown>,
          ]
        : []),
      {
        id: 'business',
        header: 'Business',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.original.business.name}</p>
            {row.original.business.city ? (
              <p className="truncate text-xs text-ink-muted">{row.original.business.city}</p>
            ) : null}
          </div>
        ),
        size: 220,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge tone={statusTone(row.original.lead.status)}>{row.original.lead.status}</StatusBadge>
        ),
        size: 130,
      },
      {
        id: 'priority',
        header: 'Priority',
        cell: ({ row }) => <span className="text-ink-muted">{row.original.lead.priority}</span>,
        size: 90,
      },
      {
        id: 'followUp',
        header: 'Follow-up',
        cell: ({ row }) => {
          const due = row.original.lead.nextFollowUpAt;
          if (!due) return <span className="text-ink-faint">—</span>;
          const date = new Date(due);
          const overdue = date.getTime() < Date.now();
          return (
            <StatusBadge tone={overdue ? 'danger' : 'warning'}>
              {date.toLocaleDateString()}
            </StatusBadge>
          );
        },
        size: 120,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          pitchToday ? (
            <button
              type="button"
              className="text-xs font-medium text-accent hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                setSelected(row.original.lead.id);
              }}
            >
              Pitch
            </button>
          ) : (
            <Link
              href={`/leads/${row.original.lead.id}`}
              className="text-xs font-medium text-accent hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              Open
            </Link>
          ),
        size: 64,
        enableSorting: false,
      },
    ],
    [pitchToday, setSelected],
  );

  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-4">
      <PageHeader compact title={PAGE_COPY.pursuits.title} description={PAGE_COPY.pursuits.description} />

      {pitchToday ? (
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <p className="text-sm font-medium text-ink">Pitch today</p>
          <PitchTodayYieldBanner sellDate={state.filters.sellDate} />
          <p className="mt-0.5 text-sm text-ink-muted">
            Tap a row to pitch in the overlay — list stays here. Record advances to the next unpitched keeper.
            {state.filters.sellDate ? ` · sell ${state.filters.sellDate}` : ''}
          </p>
          <div className="mt-2">
            <Button size="sm" variant="ghost" asChild>
              <Link
                href={`/leads?dumpster=1&sort=rankScore&direction=desc${
                  state.filters.sellDate ? `&sellDate=${state.filters.sellDate}` : ''
                }`}
              >
                View dumpster
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" asChild>
          <Link href="/follow-ups">Due follow-ups</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/review">Queue</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <CollapsibleSection
          id="pipeline-filters"
          title={`Filters & views${activeFilterCount ? ` · ${activeFilterCount} active` : ''}`}
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        >
          <div className="space-y-3 pt-2">
            <SavedViewsControl
              surface="leads"
              currentDefinition={currentDefinition}
              activeViewId={activeViewId}
              onApply={applySavedView}
              onActiveViewChange={setActiveViewId}
              productPresets={PIPELINE_PRESETS}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-ink-muted">
                Search
                <Input
                  value={draftQuery}
                  placeholder="Business, city, email, phone…"
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
                  value={state.filters.status ?? ''}
                  onChange={(event) => {
                    update({
                      filters: { ...state.filters, status: event.target.value },
                      resetPage: true,
                    });
                    setActiveViewId(null);
                  }}
                >
                  <option value="">All statuses</option>
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium text-ink-muted">
                Sort
                <select
                  className="h-9 w-full min-w-36 rounded-md border border-line bg-surface px-3 text-sm text-ink"
                  value={state.sort}
                  onChange={(event) => update({ sort: event.target.value, resetPage: true })}
                >
                  <option value="updatedAt">Updated</option>
                  <option value="createdAt">Created</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="nextFollowUpAt">Follow-up</option>
                  {pitchToday ? <option value="rank">Pitch rank</option> : null}
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
                {hasActiveFilters && (
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
          </div>
        </CollapsibleSection>
      </div>

      {error && !isLoading && (
        <ErrorState
          title="Unable to load pursuits"
          description={error.message}
          onRetry={() => void refresh()}
        />
      )}

      <BulkSelectionBar count={selectedCount} noun="pursuit" onClear={clearSelection}>
        <BulkActionButton icon={Archive} label="Archive" onClick={() => setBulkStatus('ARCHIVED')}>
          Archive
        </BulkActionButton>
        <BulkActionButton
          icon={CheckCircle2}
          label="Mark reviewed"
          variant="secondary"
          onClick={() => setBulkStatus('REVIEWED')}
        >
          Mark reviewed
        </BulkActionButton>
        <BulkActionButton
          icon={Send}
          label="Send to CRM"
          variant="secondary"
          onClick={() => setBulkPushOpen(true)}
        >
          Send to CRM
        </BulkActionButton>
      </BulkSelectionBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => row.lead.id}
        isLoading={isLoading}
        error={error && items.length === 0 ? error : null}
        onRetry={() => void refresh()}
        selectionResetToken={selectionResetToken}
        onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
        onRowActivate={(row) => {
          if (pitchToday) setSelected(row.lead.id);
          else router.push(`/leads/${row.lead.id}`);
        }}
        focusedRowId={pitchToday && selectedId ? selectedId : undefined}
        emptyTitle={
          pitchToday
            ? 'No frozen keepers for this morning'
            : hasActiveFilters
              ? 'No pursuits match these filters'
              : 'No active pursuits yet'
        }
        emptyDescription={
          pitchToday
            ? 'Pitch today is empty until night purify freezes yesterday’s harvest at 07:00 EAT. Do not pitch an unfiltered queue.'
            : hasActiveFilters
              ? 'Clear filters or broaden search to see more pursuits.'
              : 'Promote opportunities from the Queue to start pursuing them here.'
        }
        emptyAction={
          pitchToday ? (
            <Button size="sm" asChild>
              <Link href="/ops">Back to Today</Link>
            </Button>
          ) : hasActiveFilters ? (
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
            <Button size="sm" asChild>
              <Link href="/review">Open Queue</Link>
            </Button>
          )
        }
      />

      {!isLoading && !error && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
          <p>
            Showing {(state.page - 1) * state.limit + 1}–{Math.min(state.page * state.limit, total)} of {total}
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

      <Dialog
        open={bulkStatus !== null}
        onOpenChange={(open) => {
          if (!open) setBulkStatus(null);
        }}
        title={`Transition ${selectedCount} pursuit${selectedCount === 1 ? '' : 's'}?`}
        description={`Move selected pursuits to ${bulkStatus}. Invalid transitions are reported per row.`}
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setBulkStatus(null)}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" loading={bulkPending} onClick={() => void runBulkTransition()}>
            Confirm
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={bulkPushOpen}
        onOpenChange={(open) => {
          if (!open) setBulkPushOpen(false);
        }}
        title={`Send ${selectedCount} pursuit${selectedCount === 1 ? '' : 's'} to SleeklyBuilt CRM?`}
        description="Creates or updates Prospects in Operations CRM by Discovery account id. Requires bridge credentials."
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setBulkPushOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" loading={bulkPending} onClick={() => void runBulkPushCrm()}>
            Send to CRM
          </Button>
        </div>
      </Dialog>

      {pitchToday ? (
        <PitchOverlayDrawer
          open={Boolean(selectedId)}
          onOpenChange={(open) => {
            if (!open) setSelected('');
          }}
          leadId={selectedId || null}
          title={selectedRow?.business.name ?? 'Pitch keeper'}
          description={
            selectedRow
              ? [
                  selectedRow.factory?.rank ? `#${selectedRow.factory.rank}` : null,
                  selectedRow.business.city,
                  selectedRow.lead.status,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
          defaultChannel={recommendedChannelToDraft(selectedRow?.factory?.recommendedChannel)}
          onRecorded={() => void handlePitchRecorded()}
          moreHref={selectedId ? `/leads/${selectedId}` : undefined}
          hasPrev={Boolean(selectedId && prevKeeperInList(items, selectedId))}
          hasNext={Boolean(selectedId && nextKeeperInList(items, selectedId))}
          onPrev={() => {
            const prev = prevKeeperInList(items, selectedId);
            if (prev) setSelected(prev);
          }}
          onNext={() => {
            const next = nextKeeperInList(items, selectedId);
            if (next) setSelected(next);
          }}
        />
      ) : null}
    </div>
  );
}
