'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BulkActionButton, BulkSelectionBar, selectColumnDef } from '@/components/ui/bulk-selection';
import { DataTable } from '@/components/ui/data-table';
import { CaseFileSummary } from '@/components/pursuit/case-file-summary';
import { PitchOverlayDrawer } from '@/components/pursuit/pitch-overlay-drawer';
import {
  Button,
  CollapsibleSection,
  InspectorDrawer,
  Input,
  StatusBadge,
} from '@/components/ui/primitives';
import { Ban, Clock, Globe, RotateCcw, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import { useApiQuery } from '@/lib/use-api-query';
import { useListView } from '@/lib/use-list-view';
import { useToast } from '@/components/ui/toast';

const MISS_REASONS = [
  'over_cut',
  'no_phone',
  'has_website',
  'already_pursued',
  'not_operational',
  'suppressed',
  'snoozed',
] as const;

const MISS_LABELS: Record<string, string> = {
  over_cut: 'Over the 100',
  no_phone: 'No phone',
  has_website: 'Real website',
  already_pursued: 'Already pursued',
  not_operational: 'Closed / not operational',
  suppressed: 'Suppressed',
  snoozed: 'Snoozed',
};

type DumpsterRow = {
  memberId: string;
  accountId: string;
  businessId: string;
  leadId: string | null;
  missReason: string | null;
  rank: number | null;
  rankScore: number | null;
  name: string;
  city: string | null;
  country: string | null;
  industry: string | null;
  source: string;
  phone: string | null;
  website: string | null;
  suppressed: boolean;
  snoozedUntil: string | null;
};

type DumpsterResponse = {
  items: DumpsterRow[];
  total: number;
  page: number;
  limit: number;
  sellDate: string;
  harvestDate: string | null;
  status: string;
  dumpsterCount: number;
  keeperCount: number;
  reasonCounts: Record<string, number>;
};

type BulkResponse = {
  succeeded: number;
  failed: number;
  requested: number;
  results: Array<{ id: string; ok: boolean; leadId?: string | null; error?: string }>;
};

function pitchTodayHref(sellDate?: string) {
  const params = new URLSearchParams({ pitchToday: '1', sort: 'rank', direction: 'asc' });
  if (sellDate) params.set('sellDate', sellDate);
  return `/leads?${params.toString()}`;
}

function reasonTone(reason: string | null): 'neutral' | 'info' | 'warning' | 'danger' {
  if (reason === 'over_cut') return 'info';
  if (reason === 'no_phone' || reason === 'snoozed') return 'warning';
  if (reason === 'has_website' || reason === 'already_pursued') return 'neutral';
  return 'danger';
}

export function DumpsterWorkspace() {
  const { state, update, toQueryString } = useListView({
    sort: 'rankScore',
    direction: 'desc',
    limit: 20,
  });
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionResetToken, setSelectionResetToken] = useState(0);
  const [pending, setPending] = useState(false);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { push } = useToast();

  const path = useMemo(() => `/api/factory/dumpster?${toQueryString()}`, [toQueryString]);
  const { data, error, isLoading, refresh } = useApiQuery<DumpsterResponse>(path);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / state.limit));
  const inspected = items.find((row) => row.memberId === inspectId) ?? null;
  const missReason = state.filters.missReason ?? '';

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setFiltersOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const runAction = async (action: string, memberIds: string[]) => {
    if (memberIds.length === 0) return;
    setPending(true);
    try {
      const result = await api<BulkResponse>('/api/factory/dumpster/actions', {
        method: 'POST',
        body: JSON.stringify({
          action,
          memberIds,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const titles: Record<string, string> = {
        restore: 'Restored to Pitch today',
        pitch_anyway: 'Opened as a pursuit',
        snooze: 'Snoozed',
        suppress: 'Suppressed',
        mark_has_website: 'Marked as has website',
      };
      push({
        tone: result.failed > 0 ? 'info' : 'success',
        title: titles[action] ?? 'Dumpster update finished',
        description: `${result.succeeded} succeeded, ${result.failed} failed of ${result.requested}.`,
      });
      setSelectedIds(new Set());
      setSelectionResetToken((token) => token + 1);
      if (action === 'restore') setInspectId(null);
      await refresh();
    } catch (reason) {
      push({
        tone: 'error',
        title: 'Dumpster action failed',
        description: reason instanceof Error ? reason.message : 'Request failed',
      });
    } finally {
      setPending(false);
    }
  };

  const columns = useMemo<ColumnDef<DumpsterRow, unknown>[]>(
    () => [
      selectColumnDef<DumpsterRow>({
        headerAriaLabel: 'Select all dumpster rows on this page',
        getRowLabel: (row) => row.name,
      }),
      {
        id: 'business',
        header: 'Business',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.original.name}</p>
            <p className="truncate text-xs text-ink-muted">
              {[row.original.city, row.original.country].filter(Boolean).join(', ') || 'No geo'}
            </p>
          </div>
        ),
        size: 220,
      },
      {
        id: 'reason',
        header: 'Miss reason',
        cell: ({ row }) => (
          <StatusBadge tone={reasonTone(row.original.missReason)}>
            {MISS_LABELS[row.original.missReason ?? ''] ?? 'Unknown'}
          </StatusBadge>
        ),
        size: 150,
      },
      {
        id: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-sm text-ink-muted">{row.original.phone || '—'}</span>
        ),
        size: 130,
      },
      {
        id: 'source',
        header: 'Source',
        cell: ({ row }) => <span className="text-xs text-ink-muted">{row.original.source}</span>,
        size: 110,
      },
      {
        id: 'score',
        header: 'Rank score',
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-ink">
            {row.original.rankScore ?? '—'}
          </span>
        ),
        size: 90,
      },
    ],
    [],
  );

  const frozen = data?.status === 'frozen';
  const emptyTitle = !frozen
    ? 'Dumpster is empty until freeze'
    : missReason
      ? 'No remainder matches this filter'
      : 'Nothing left in dumpster';
  const emptyDescription = !frozen
    ? 'Night purify writes miss reasons here after 22:00 EAT. Daytime harvest feeds tomorrow.'
    : missReason
      ? 'Clear the miss-reason filter to see the rest of yesterday’s remainder.'
      : 'Pitch today kept the recoverable list — leftover inventory will land here on the next freeze.';

  return (
    <div className="space-y-4">
      <PageHeader compact title={PAGE_COPY.dumpster.title} description={PAGE_COPY.dumpster.description} />

      <div className="rounded-lg border border-line bg-surface px-4 py-3">
        <p className="text-sm font-medium text-ink">Recoverable remainder</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {frozen
            ? `${data?.dumpsterCount ?? 0} in dumpster from yesterday’s harvest · ${data?.keeperCount ?? 0} on Pitch today.`
            : 'This is not trash. Over-the-100 rows can compete again tomorrow.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" asChild>
          <Link href={pitchTodayHref(state.filters.sellDate)}>Back to Pitch today</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/ops">Today</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={!missReason ? 'secondary' : 'ghost'}
          className="h-11 min-h-11"
          onClick={() => update({ filters: { ...state.filters, dumpster: '1', missReason: '' }, resetPage: true })}
        >
          All remainder
        </Button>
        {MISS_REASONS.filter((reason) => reason !== 'snoozed' || state.filters.includeSnoozed).map((reason) => {
          const count = data?.reasonCounts?.[reason];
          return (
            <Button
              key={reason}
              size="sm"
              variant={missReason === reason ? 'secondary' : 'ghost'}
              className="h-11 min-h-11"
              onClick={() =>
                update({
                  filters: { ...state.filters, dumpster: '1', missReason: reason },
                  resetPage: true,
                })
              }
            >
              {MISS_LABELS[reason]}
              {typeof count === 'number' ? ` (${count})` : ''}
            </Button>
          );
        })}
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <CollapsibleSection
          id="dumpster-filters"
          title="Search & filters"
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        >
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-xs font-medium text-ink-muted sm:col-span-2">
              Search
              <Input
                value={draftQuery}
                placeholder="Business, city, phone, industry…"
                onChange={(event) => setDraftQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    update({ q: draftQuery.trim(), resetPage: true });
                  }
                }}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-ink-muted">
              Country
              <Input
                value={state.filters.country ?? ''}
                placeholder="Uganda"
                onChange={(event) =>
                  update({ filters: { ...state.filters, dumpster: '1', country: event.target.value }, resetPage: true })
                }
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-ink-muted">
              Industry
              <Input
                value={state.filters.industry ?? ''}
                placeholder="Restaurant"
                onChange={(event) =>
                  update({
                    filters: { ...state.filters, dumpster: '1', industry: event.target.value },
                    resetPage: true,
                  })
                }
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-ink-muted">
              Source
              <Input
                value={state.filters.source ?? ''}
                placeholder="google_maps"
                onChange={(event) =>
                  update({ filters: { ...state.filters, dumpster: '1', source: event.target.value }, resetPage: true })
                }
              />
            </label>
            <label className="flex h-11 min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-accent"
                checked={state.filters.includeSnoozed === '1'}
                onChange={(event) =>
                  update({
                    filters: { ...state.filters, dumpster: '1', includeSnoozed: event.target.checked ? '1' : '' },
                    resetPage: true,
                  })
                }
              />
              Include snoozed
            </label>
          </div>
        </CollapsibleSection>
      </div>

      <BulkSelectionBar
        count={selectedIds.size}
        noun="remainder row"
        onClear={() => {
          setSelectedIds(new Set());
          setSelectionResetToken((token) => token + 1);
        }}
      >
        <BulkActionButton
          icon={RotateCcw}
          label="Restore to Pitch today"
          disabled={pending}
          onClick={() => void runAction('restore', [...selectedIds])}
        >
          Restore
        </BulkActionButton>
        <BulkActionButton
          icon={Send}
          label="Pitch anyway"
          variant="secondary"
          disabled={pending}
          onClick={() => void runAction('pitch_anyway', [...selectedIds])}
        >
          Pitch anyway
        </BulkActionButton>
        <BulkActionButton
          icon={Clock}
          label="Snooze"
          variant="secondary"
          disabled={pending}
          onClick={() => void runAction('snooze', [...selectedIds])}
        >
          Snooze
        </BulkActionButton>
        <BulkActionButton
          icon={Globe}
          label="Mark has website"
          variant="secondary"
          disabled={pending}
          onClick={() => void runAction('mark_has_website', [...selectedIds])}
        >
          Has website
        </BulkActionButton>
        <BulkActionButton
          icon={Ban}
          label="Suppress"
          variant="secondary"
          disabled={pending}
          onClick={() => void runAction('suppress', [...selectedIds])}
        >
          Suppress
        </BulkActionButton>
      </BulkSelectionBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => row.memberId}
        isLoading={isLoading}
        error={error && items.length === 0 ? error : null}
        onRetry={() => void refresh()}
        selectionResetToken={selectionResetToken}
        onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
        onRowActivate={(row) => setInspectId(row.memberId)}
        focusedRowId={inspectId}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={
          frozen ? (
            <Button size="sm" asChild>
              <Link href={pitchTodayHref(data?.sellDate)}>Open Pitch today</Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href="/ops">Back to Today</Link>
            </Button>
          )
        }
      />

      {!isLoading && !error && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
          <p>
            {total} remainder · page {state.page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={state.page <= 1}
              onClick={() => update({ page: state.page - 1 })}
            >
              Previous
            </Button>
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

      <PitchOverlayDrawer
        open={Boolean(inspected?.leadId)}
        onOpenChange={(open) => {
          if (!open) setInspectId(null);
        }}
        leadId={inspected?.leadId ?? null}
        title={inspected?.name ?? 'Dumpster row'}
        description={
          inspected
            ? MISS_LABELS[inspected.missReason ?? ''] ?? 'Remainder'
            : undefined
        }
        moreHref={inspected?.leadId ? `/leads/${inspected.leadId}` : undefined}
        promoteAction={
          inspected ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="h-11 min-h-11"
                variant="primary"
                disabled={pending}
                onClick={() => void runAction('restore', [inspected.memberId])}
              >
                Restore to Pitch today
              </Button>
              <Button
                className="h-11 min-h-11"
                variant="secondary"
                disabled={pending}
                onClick={() => void runAction('pitch_anyway', [inspected.memberId])}
              >
                Pitch anyway
              </Button>
            </div>
          ) : null
        }
      />

      <InspectorDrawer
        open={Boolean(inspected && !inspected.leadId)}
        onOpenChange={(open) => {
          if (!open) setInspectId(null);
        }}
        title={inspected?.name ?? 'Dumpster row'}
        description={inspected ? MISS_LABELS[inspected.missReason ?? ''] ?? 'Remainder' : undefined}
        footer={
          inspected ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="h-11 min-h-11"
                variant="primary"
                disabled={pending}
                onClick={() => void runAction('restore', [inspected.memberId])}
              >
                Restore to Pitch today
              </Button>
              <Button
                className="h-11 min-h-11"
                disabled={pending}
                onClick={() => void runAction('pitch_anyway', [inspected.memberId])}
              >
                Pitch anyway
              </Button>
            </div>
          ) : null
        }
      >
        {inspected ? (
          <div className="space-y-4 text-sm">
            <CaseFileSummary businessId={inspected.businessId} promoteAllowed />
            <p className="text-ink-muted">
              {[inspected.city, inspected.country, inspected.industry].filter(Boolean).join(' · ') ||
                'No geo or industry'}
            </p>
            <p>
              <span className="text-ink-muted">Phone</span> · {inspected.phone || 'None'}
            </p>
            <p>
              <span className="text-ink-muted">Source</span> · {inspected.source}
            </p>
            {inspected.website ? (
              <p className="break-all">
                <span className="text-ink-muted">Website</span> · {inspected.website}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" disabled={pending} onClick={() => void runAction('snooze', [inspected.memberId])}>
                Snooze 7 days
              </Button>
              <Button
                size="sm"
                disabled={pending}
                onClick={() => void runAction('mark_has_website', [inspected.memberId])}
              >
                Mark has website
              </Button>
              <Button size="sm" disabled={pending} onClick={() => void runAction('suppress', [inspected.memberId])}>
                Suppress
              </Button>
            </div>
          </div>
        ) : null}
      </InspectorDrawer>
    </div>
  );
}
