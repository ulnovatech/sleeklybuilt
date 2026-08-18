'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { MarkRepliedForm } from '@/components/MarkRepliedForm';
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
  SelectionCheckbox,
} from '@/components/ui/bulk-selection';
import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { Archive, MessageSquareOff } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import { useApiQuery } from '@/lib/use-api-query';
import { useListView } from '@/lib/use-list-view';

type LeadRow = {
  lead: { id: string; status: string; nextFollowUpAt: string | null };
  business: { name: string };
};

type FollowUpsResponse = {
  items: LeadRow[];
  leads: LeadRow[];
  total: number;
  page: number;
  limit: number;
};

type BulkAction = { toStatus: 'NO_RESPONSE' | 'ARCHIVED'; label: string; description: string };

const BULK_ACTIONS: Record<string, BulkAction> = {
  NO_RESPONSE: {
    toStatus: 'NO_RESPONSE',
    label: 'Mark no response',
    description:
      'These pursuits move to NO_RESPONSE and leave the follow-up queue. Outreach history and evidence are preserved.',
  },
  ARCHIVED: {
    toStatus: 'ARCHIVED',
    label: 'Archive',
    description:
      'These pursuits move to ARCHIVED and stop appearing in the pipeline and follow-up queue.',
  },
};

const FOLLOW_UP_PRESETS: ProductSavedView[] = [
  {
    id: 'preset:due-soonest',
    name: 'Due soonest',
    definition: { filters: {}, sort: 'nextFollowUpAt', direction: 'asc', density: 'compact' },
  },
  {
    id: 'preset:contacted',
    name: 'Contacted only',
    definition: {
      filters: { status: 'CONTACTED' },
      sort: 'nextFollowUpAt',
      direction: 'asc',
      density: 'compact',
    },
  },
  {
    id: 'preset:replied',
    name: 'Replied — needs qualification',
    definition: {
      filters: { status: 'REPLIED' },
      sort: 'nextFollowUpAt',
      direction: 'asc',
      density: 'compact',
    },
  },
];

function nextStepLabel(status: string) {
  if (status === 'REPLIED') return 'Qualify';
  if (status === 'QUALIFIED') return 'Send proposal';
  if (status === 'PROPOSAL_SENT') return 'Record outcome';
  return 'Review pursuit';
}

export default function FollowUpsPage() {
  return (
    <Suspense fallback={<FollowUpsSkeleton />}>
      <FollowUpsPageContent />
    </Suspense>
  );
}

function FollowUpsPageContent() {
  const { state, update, clearFilters, toQueryString } = useListView({
    sort: 'nextFollowUpAt',
    direction: 'asc',
    limit: 20,
  });
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [bulkPending, setBulkPending] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const { push } = useToast();
  const path = useMemo(() => `/api/crm/follow-ups?${toQueryString()}`, [toQueryString]);
  const { data, error, isLoading, refresh } = useApiQuery<FollowUpsResponse>(path);

  const items = data?.items ?? data?.leads ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / state.limit));
  const hasFilters = Boolean(state.q || state.filters.status);
  const selectedCount = selectedIds.size;
  /** NO_RESPONSE is only reachable from CONTACTED; block the action instead of failing per row. */
  const selectionAllContacted =
    selectedCount > 0 &&
    items
      .filter((row) => selectedIds.has(row.lead.id))
      .every((row) => row.lead.status === 'CONTACTED');

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
    setSelectedIds(new Set());
    update({
      q,
      sort: view.definition.sort ?? state.sort,
      direction: view.definition.direction ?? state.direction,
      density: view.definition.density ?? state.density,
      filters: nextFilters,
      page: 1,
    });
  };

  const toggleRow = (leadId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.size === items.length ? new Set() : new Set(items.map((row) => row.lead.id)),
    );
  };

  const runBulkAction = async () => {
    if (!pendingAction || selectedCount === 0) return;
    setBulkPending(true);
    try {
      const result = await api<{ succeeded: number; failed: number }>('/api/crm/leads/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'transition',
          leadIds: [...selectedIds],
          toStatus: pendingAction.toStatus,
          note: `Bulk ${pendingAction.label.toLowerCase()} from follow-up queue`,
          idempotencyKey: `followups-${pendingAction.toStatus}-${Date.now()}-${selectedCount}`,
        }),
      });
      push({
        tone: result.failed > 0 ? 'error' : 'success',
        title: `${result.succeeded} pursuit${result.succeeded === 1 ? '' : 's'} updated`,
        description:
          result.failed > 0
            ? `${result.failed} could not be updated. Review them in Pipeline.`
            : `${pendingAction.label} applied and recorded in the audit log.`,
      });
      setSelectedIds(new Set());
      setPendingAction(null);
      await refresh();
    } catch (reason) {
      push({
        tone: 'error',
        title: 'Bulk update failed',
        description: reason instanceof Error ? reason.message : 'No pursuits were changed.',
      });
    } finally {
      setBulkPending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader title={PAGE_COPY.followUps.title} description={PAGE_COPY.followUps.description} />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" asChild>
          <Link href="/leads?status=CONTACTED&sort=nextFollowUpAt&direction=asc">Open in Pipeline</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/review">Queue</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-ink-muted">
          Search
          <Input
            value={draftQuery}
            placeholder="Business, city, email, phone…"
            onChange={(event) => setDraftQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') update({ q: draftQuery.trim(), resetPage: true });
            }}
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Stage
          <select
            className="h-9 w-full min-w-40 rounded-md border border-line bg-surface px-3 text-sm text-ink"
            value={state.filters.status ?? ''}
            onChange={(event) => {
              setSelectedIds(new Set());
              update({ filters: { ...state.filters, status: event.target.value }, resetPage: true });
              setActiveViewId(null);
            }}
          >
            <option value="">All due stages</option>
            <option value="CONTACTED">Contacted</option>
            <option value="REPLIED">Replied</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL_SENT">Proposal sent</option>
          </select>
        </label>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => update({ q: draftQuery.trim(), resetPage: true })}>
            Apply
          </Button>
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraftQuery('');
                setSelectedIds(new Set());
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
        surface="follow_ups"
        currentDefinition={currentDefinition}
        activeViewId={activeViewId}
        onApply={applySavedView}
        onActiveViewChange={setActiveViewId}
        productPresets={FOLLOW_UP_PRESETS}
      />

      {isLoading && <FollowUpsSkeleton />}

      {!isLoading && error && (
        <ErrorState
          title="Unable to load follow-ups"
          description={error.message}
          onRetry={() => void refresh()}
        />
      )}

      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          title={hasFilters ? 'No follow-ups match these filters' : 'No overdue follow-ups'}
          description={
            hasFilters
              ? 'Clear filters to see all contacted pursuits due for follow-up.'
              : 'When you mark pursuits contacted with a follow-up date, they appear here when due.'
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
            ) : (
              <Button size="sm" asChild>
                <Link href="/leads">Open pursuits</Link>
              </Button>
            )
          }
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="flex items-center gap-2 px-1 text-sm text-ink-muted">
            <SelectionCheckbox
              aria-label="Select all follow-ups on this page"
              checked={selectedCount > 0 && selectedCount === items.length}
              indeterminate={selectedCount > 0 && selectedCount < items.length}
              onChange={() => toggleAll()}
            />
            <span>{selectedCount > 0 ? `${selectedCount} selected on page` : 'Select all on page'}</span>
          </div>

          <BulkSelectionBar
            count={selectedCount}
            noun="follow-up"
            onClear={() => setSelectedIds(new Set())}
          >
            <BulkActionButton
              icon={MessageSquareOff}
              label="Mark no response"
              variant="secondary"
              disabled={!selectionAllContacted}
              title={
                selectedCount === 0
                  ? 'Select at least one follow-up'
                  : !selectionAllContacted
                    ? 'Only Contacted pursuits can move to no response'
                    : undefined
              }
              onClick={() => setPendingAction(BULK_ACTIONS.NO_RESPONSE)}
            >
              Mark no response
            </BulkActionButton>
            <BulkActionButton
              icon={Archive}
              label="Archive"
              variant="danger"
              disabled={selectedCount === 0}
              title={selectedCount === 0 ? 'Select at least one follow-up' : undefined}
              onClick={() => setPendingAction(BULK_ACTIONS.ARCHIVED)}
            >
              Archive
            </BulkActionButton>
          </BulkSelectionBar>

          <div className="space-y-3">
            {items.map((row) => {
              const dueAt = row.lead.nextFollowUpAt ? new Date(row.lead.nextFollowUpAt) : null;
              const overdue = dueAt ? dueAt.getTime() < Date.now() : false;
              return (
                <div
                  key={row.lead.id}
                  className="flex justify-between gap-4 rounded-lg border border-line bg-surface p-4"
                >
                  <div className="flex min-w-0 gap-3">
                    <SelectionCheckbox
                      className="mt-0.5"
                      checked={selectedIds.has(row.lead.id)}
                      onChange={() => toggleRow(row.lead.id)}
                      aria-label={`Select ${row.business.name}`}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-ink">{row.business.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                        <StatusBadge tone="neutral">{row.lead.status}</StatusBadge>
                        {dueAt && (
                          <StatusBadge tone={overdue ? 'danger' : 'warning'}>
                            {overdue ? 'Overdue' : 'Due'} {dueAt.toLocaleDateString()}
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {row.lead.status === 'CONTACTED' ? (
                      <MarkRepliedForm leadId={row.lead.id} onDone={() => void refresh()} compact />
                    ) : (
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/leads/${row.lead.id}`}>{nextStepLabel(row.lead.status)}</Link>
                      </Button>
                    )}
                    <Link href={`/leads/${row.lead.id}`} className="text-sm text-accent hover:underline">
                      Open pursuit →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
            <p>
              Showing {(state.page - 1) * state.limit + 1}–
              {Math.min(state.page * state.limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={state.page <= 1}
                onClick={() => {
                  setSelectedIds(new Set());
                  update({ page: state.page - 1 });
                }}
              >
                Previous
              </Button>
              <span>
                Page {state.page} / {totalPages}
              </span>
              <Button
                size="sm"
                disabled={state.page >= totalPages}
                onClick={() => {
                  setSelectedIds(new Set());
                  update({ page: state.page + 1 });
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction
            ? `${pendingAction.label} for ${selectedCount} pursuit${selectedCount === 1 ? '' : 's'}?`
            : ''
        }
        description={pendingAction?.description}
      >
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setPendingAction(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={pendingAction?.toStatus === 'ARCHIVED' ? 'danger' : 'primary'}
            loading={bulkPending}
            onClick={() => void runBulkAction()}
          >
            {pendingAction?.label ?? 'Confirm'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function FollowUpsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}
