'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { OutreachQueueRow, PursuitWorkspace } from '@/components/pursuit';
import type { DraftChannel, OutreachQueueResponse } from '@/components/pursuit';
import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  StatusBadge,
} from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { useApiQuery } from '@/lib/use-api-query';
import { useListView } from '@/lib/use-list-view';
import { PAGE_COPY } from '@/lib/product-copy';

const QUEUE_STATUSES = ['REVIEWED', 'QUALIFIED', 'CONTACTED', 'REPLIED', 'NO_RESPONSE'] as const;
const CHANNEL_FILTERS = [
  { id: 'any', label: 'Any channel' },
  { id: 'email', label: 'Email' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'phone', label: 'Phone' },
] as const;
const SORT_OPTIONS = [
  { id: 'follow_up', label: 'Follow-up due' },
  { id: 'priority', label: 'Priority' },
  { id: 'score', label: 'Score' },
  { id: 'updatedAt', label: 'Updated' },
  { id: 'name', label: 'Name' },
] as const;
const EXPORT_CHANNELS: Array<{ id: DraftChannel; label: string }> = [
  { id: 'email', label: 'Email pitches' },
  { id: 'whatsapp', label: 'WhatsApp pitches' },
  { id: 'phone', label: 'Phone scripts' },
  { id: 'follow_up', label: 'Follow-up pitches' },
];

type QueueListView = ReturnType<typeof useListView>;

function isDesktopViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

export default function OutreachQueuePage() {
  return (
    <Suspense fallback={<OutreachQueueSkeleton />}>
      <OutreachQueuePageContent />
    </Suspense>
  );
}

function OutreachQueuePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const list = useListView({
    sort: 'follow_up',
    direction: 'asc',
    limit: 20,
  });
  const { state, update } = list;
  const [draftQuery, setDraftQuery] = useState(state.q);
  const [exportChannel, setExportChannel] = useState<DraftChannel>('email');
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [exportPreview, setExportPreview] = useState<{
    count: number;
    skippedNoDraft: number;
    skippedNoContact: number;
    skippedSuppressed: number;
    skippedReachability: number;
    message: string;
  } | null>(null);

  const selectedId = searchParams.get('selected') ?? '';

  const apiPath = useMemo(() => {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    params.set('sort', state.sort);
    params.set('direction', state.direction);
    params.set('page', String(state.page));
    params.set('limit', String(state.limit));
    if (state.filters.status) params.set('status', state.filters.status);
    if (state.filters.channel && state.filters.channel !== 'any') {
      params.set('channel', state.filters.channel);
    }
    if (state.filters.followUpDue && state.filters.followUpDue !== 'any') {
      params.set('followUpDue', state.filters.followUpDue);
    }
    return `/api/outreach/queue?${params.toString()}`;
  }, [state.direction, state.filters.channel, state.filters.followUpDue, state.filters.status, state.limit, state.page, state.q, state.sort]);

  const { data, error, isLoading, refresh } = useApiQuery<OutreachQueueResponse>(apiPath);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / state.limit));

  const setSelected = useCallback(
    (leadId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (leadId) params.set('selected', leadId);
      else params.delete('selected');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectRow = useCallback(
    (leadId: string) => {
      if (!isDesktopViewport()) {
        router.push(`/leads/${leadId}?from=outreach`);
        return;
      }
      setSelected(leadId);
    },
    [router, setSelected],
  );

  useEffect(() => {
    if (!items.length || !isDesktopViewport()) return;
    if (selectedId && items.some((item) => item.leadId === selectedId)) return;
    setSelected(items[0].leadId);
  }, [items, selectedId, setSelected]);

  const downloadExport = async (confirmSkipped: boolean) => {
    setExporting(true);
    setExportNote(null);
    try {
      const params = new URLSearchParams({
        channel: exportChannel,
        date: 'today',
      });
      if (confirmSkipped) params.set('confirmSkipped', 'true');
      const res = await fetch(`/api/outreach/export?${params}`, {
        headers: { 'X-Dev-User': 'operator' },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Export failed');
      }
      const blob = await res.blob();
      const count = res.headers.get('X-Export-Count') ?? '?';
      const skippedDraft = res.headers.get('X-Export-Skipped-No-Draft') ?? '0';
      const skippedContact = res.headers.get('X-Export-Skipped-No-Contact') ?? '0';
      const skippedSuppressed = res.headers.get('X-Export-Skipped-Suppressed') ?? '0';
      const skippedReach = res.headers.get('X-Export-Skipped-Reachability') ?? '0';
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `outreach-drafts-${exportChannel}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      const note = `Exported ${count} cached ${exportChannel} pitch(es). Skipped ${skippedDraft} without a draft, ${skippedContact} without contact, ${skippedSuppressed} suppressed, ${skippedReach} below reachability.`;
      setExportNote(note);
      setExportConfirmOpen(false);
      setExportPreview(null);
      push({ tone: 'success', title: 'Draft export ready', description: note });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Export failed';
      setExportNote(message);
      push({ tone: 'error', title: 'Export failed', description: message });
    } finally {
      setExporting(false);
    }
  };

  const beginExport = async () => {
    setExporting(true);
    setExportNote(null);
    let proceedWithoutConfirm = false;
    try {
      const params = new URLSearchParams({
        channel: exportChannel,
        date: 'today',
        dryRun: 'true',
      });
      const res = await fetch(`/api/outreach/export?${params}`, {
        headers: { 'X-Dev-User': 'operator' },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Export preview failed');
      }
      if ((payload.count ?? 0) === 0 && (payload.skippedNoDraft ?? 0) === 0) {
        setExportNote(payload.message ?? 'No rows to export.');
        push({
          tone: 'info',
          title: 'Nothing to export',
          description: payload.message ?? 'Generate pitches first, then export.',
        });
        return;
      }
      if (payload.requiresConfirm || (payload.skippedNoDraft ?? 0) > 0) {
        setExportPreview({
          count: payload.count ?? 0,
          skippedNoDraft: payload.skippedNoDraft ?? 0,
          skippedNoContact: payload.skippedNoContact ?? 0,
          skippedSuppressed: payload.skippedSuppressed ?? 0,
          skippedReachability: payload.skippedReachability ?? 0,
          message: payload.message ?? '',
        });
        setExportConfirmOpen(true);
        return;
      }
      proceedWithoutConfirm = true;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Export failed';
      setExportNote(message);
      push({ tone: 'error', title: 'Export failed', description: message });
    } finally {
      if (!proceedWithoutConfirm) setExporting(false);
    }
    if (proceedWithoutConfirm) {
      await downloadExport(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        compact
        title={PAGE_COPY.outreach.title}
        description={PAGE_COPY.outreach.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" asChild>
              <Link href="/review">Open review queue</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
              <Link href="/leads">Pipeline</Link>
        </Button>
      </div>
        }
      />

      <OutreachQueueToolbar
        list={list}
        draftQuery={draftQuery}
        setDraftQuery={setDraftQuery}
        exportChannel={exportChannel}
        setExportChannel={setExportChannel}
        exporting={exporting}
        onExport={() => void beginExport()}
      />

      <Dialog
        open={exportConfirmOpen}
        onOpenChange={(open) => {
          setExportConfirmOpen(open);
          if (!open) setExportPreview(null);
        }}
        title="Confirm draft export"
        description={
          exportPreview?.message ??
          'Some pursuits lack a cached draft for this channel and will be skipped.'
        }
      >
        {exportPreview && (
          <ul className="mb-4 space-y-1 text-sm text-ink-muted">
            <li>Cached drafts to export: {exportPreview.count}</li>
            <li>Skipped without draft: {exportPreview.skippedNoDraft}</li>
            <li>Skipped without contact: {exportPreview.skippedNoContact}</li>
            <li>Skipped suppressed: {exportPreview.skippedSuppressed}</li>
            <li>Skipped reachability: {exportPreview.skippedReachability}</li>
        </ul>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setExportConfirmOpen(false);
              setExportPreview(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            loading={exporting}
            disabled={!exportPreview || exportPreview.count === 0}
            onClick={() => void downloadExport(true)}
          >
            Export {exportPreview?.count ?? 0} draft(s)
          </Button>
        </div>
      </Dialog>

      {data?.ownerScope && data.ownerScope !== 'all' && (
        <p className="text-xs text-ink-muted">Showing your pursuits only (owner scope).</p>
      )}

      <p className="rounded-md border border-line bg-surface-raised px-3 py-2 text-xs text-ink-muted">
        CSV export uses generated pitches only — not templates. Pursuits without a cached draft for the
        chosen channel are skipped. Suppressed accounts and rows below ICP reachability never export.
      </p>
      {exportNote && <p className="text-xs text-ink-muted">{exportNote}</p>}

      {error && (
        <ErrorState
          title="Outreach Queue could not load"
          description={error.message}
          onRetry={() => void refresh()}
        />
      )}

      {isLoading && <OutreachQueueSkeleton />}

      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          title="No pursuits ready for outreach"
          description="Promote opportunities from Review, or check Pipeline for pursuits already in later stages."
          action={
            <Button size="sm" asChild>
              <Link href="/review">Open review queue</Link>
            </Button>
          }
        />
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-2 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-ink-muted">
                {total} pursuit{total === 1 ? '' : 's'} · page {state.page}/{totalPages}
              </p>
              <StatusBadge tone="info">Select to pitch</StatusBadge>
            </div>
            <ul className="space-y-2" aria-label="Outreach queue">
              {items.map((item) => (
                <li key={item.leadId}>
                  <OutreachQueueRow
                    item={item}
                    selected={item.leadId === selectedId}
                    onSelect={() => selectRow(item.leadId)}
                  />
                      </li>
                    ))}
                  </ul>
            {totalPages > 1 && (
              <div className="flex justify-between gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={state.page <= 1}
                  onClick={() => update({ page: state.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={state.page >= totalPages}
                  onClick={() => update({ page: state.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
            <p className="px-1 text-[11px] text-ink-faint lg:hidden">
              Opening a pursuit on a narrow screen goes to the full workspace.
            </p>
          </div>

          <div className="hidden min-w-0 lg:block">
            {selectedId ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">Pursuit workspace</p>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/leads/${selectedId}?from=outreach`}>
                      Open full page
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <PursuitWorkspace leadId={selectedId} onOutreachRecorded={() => void refresh()} />
          </div>
            ) : (
              <EmptyState
                title="Select a pursuit"
                description="Choose a queue item to scan the Case File and generate a channel pitch."
                className="min-h-64"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OutreachQueueToolbar({
  list,
  draftQuery,
  setDraftQuery,
  exportChannel,
  setExportChannel,
  exporting,
  onExport,
}: {
  list: QueueListView;
  draftQuery: string;
  setDraftQuery: (value: string) => void;
  exportChannel: DraftChannel;
  setExportChannel: (value: DraftChannel) => void;
  exporting: boolean;
  onExport: () => void;
}) {
  const { state, update, clearFilters } = list;
  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-3 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
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
          Status
          <select
            className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink lg:w-44"
            value={state.filters.status ?? ''}
            onChange={(event) =>
              update({ filters: { ...state.filters, status: event.target.value }, resetPage: true })
            }
          >
            <option value="">All queue stages</option>
            {QUEUE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Channel
          <select
            className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink lg:w-40"
            value={state.filters.channel ?? 'any'}
            onChange={(event) =>
              update({ filters: { ...state.filters, channel: event.target.value }, resetPage: true })
            }
          >
            {CHANNEL_FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Sort
        <select
            className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink lg:w-40"
            value={state.sort}
            onChange={(event) => update({ sort: event.target.value, resetPage: true })}
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          size="sm"
          onClick={() => update({ q: draftQuery.trim(), resetPage: true })}
        >
          Apply
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDraftQuery('');
            clearFilters();
          }}
        >
          Clear
        </Button>
      </div>
      <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-ink-muted">
          Export channel
          <select
            className="h-8 rounded-md border border-line bg-surface px-2 text-sm text-ink"
            value={exportChannel}
            onChange={(event) => setExportChannel(event.target.value as DraftChannel)}
          >
            {EXPORT_CHANNELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
            </option>
          ))}
        </select>
        </label>
        <Button size="sm" variant="secondary" loading={exporting} onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export cached drafts
        </Button>
      </div>
    </div>
  );
}

function OutreachQueueSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="hidden h-80 w-full lg:block" />
    </div>
  );
}
