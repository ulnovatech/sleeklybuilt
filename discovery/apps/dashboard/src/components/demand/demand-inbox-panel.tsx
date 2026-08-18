'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessPicker, type PickedBusiness } from '@/components/business/business-picker';
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
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import {
  DEMAND_JUMP_REASON_COPY,
  pitchTodayHrefForLead,
  type DemandJumpResult,
} from '@/lib/factory-demand-copy';

type OrphanSignal = {
  id: string;
  source: string;
  signalType: string;
  signalStrength: number;
  title: string | null;
  snippet: string | null;
  sourceUrl: string | null;
  capturedAt: string;
};

type ProspectDraft = {
  name: string;
  city: string;
  country: string;
  industry: string;
  business: PickedBusiness | null;
};

function defaultDraft(signal: OrphanSignal): ProspectDraft {
  const title = signal.title?.replace(/^\[[^\]]+\]\s*/, '').trim() ?? '';
  return {
    name: title.slice(0, 200),
    city: '',
    country: '',
    industry: '',
    business: null,
  };
}

export function DemandInboxPanel() {
  const [items, setItems] = useState<OrphanSignal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ProspectDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);
  const limit = 20;
  const router = useRouter();
  const { push } = useToast();

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    try {
      const data = await api<{ items: OrphanSignal[]; total: number }>(
        `/api/intent/demand-inbox?${params}`,
      );
      setItems(data.items);
      setTotal(data.total);
      setLoadError(null);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const item of data.items) {
          if (!next[item.id]) next[item.id] = defaultDraft(item);
        }
        return next;
      });
    } catch (reason) {
      setLoadError(reason instanceof Error ? reason.message : 'Failed to load demand inbox');
    } finally {
      setInitialLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const routeAfterDemandAction = (jump: DemandJumpResult | undefined, fallbackHref: string) => {
    if (jump?.jumped && jump.leadId) {
      push({
        tone: 'success',
        title: jump.already ? 'Already on Pitch today' : 'Jumped to Pitch today',
        description: 'Hot demand is on the frozen list — it did not mix today’s harvest into the 100.',
      });
      router.push(pitchTodayHrefForLead(jump.leadId));
      return;
    }
    push({
      tone: 'success',
      title: 'Saved to Queue',
      description: jump?.reason
        ? DEMAND_JUMP_REASON_COPY[jump.reason]
        : 'Open it from the Queue. Same-day jump needs a frozen Pitch today list and a phone.',
    });
    router.push(fallbackHref);
  };

  const updateDraft = (signalId: string, patch: Partial<ProspectDraft>) => {
    setDrafts((prev) => {
      const current = prev[signalId];
      if (!current) return prev;
      return { ...prev, [signalId]: { ...current, ...patch } };
    });
  };

  const dismiss = async (id: string) => {
    setLoading(id);
    setError(null);
    try {
      await api(`/api/intent/demand-inbox/${id}/dismiss`, { method: 'POST' });
      push({ tone: 'success', title: 'Signal dismissed' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dismiss failed');
    } finally {
      setLoading(null);
    }
  };

  const bulkDismiss = async () => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    setError(null);
    try {
      const result = await api<{ succeeded: number; failed: number; requested: number }>(
        '/api/intent/demand-inbox/bulk',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'dismiss',
            signalIds: [...selectedIds],
            idempotencyKey: crypto.randomUUID(),
          }),
        },
      );
      setBulkOpen(false);
      setSelectedIds(new Set());
      push({
        tone: result.failed > 0 ? 'error' : 'success',
        title: `${result.succeeded} of ${result.requested} signals dismissed`,
        description:
          result.failed > 0
            ? `${result.failed} failed. Review them in Automation Center → Bulk operations.`
            : 'Recorded in the bulk operation audit log.',
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bulk dismiss failed');
    } finally {
      setBulkPending(false);
    }
  };

  const createProspect = async (id: string) => {
    const draft = drafts[id];
    if (!draft?.name.trim()) {
      setError('Business name is required to create a prospect');
      return;
    }
    setLoading(`create-${id}`);
    setError(null);
    try {
      const result = await api<{
        businessId: string;
        reviewUrl: string;
        factoryJump?: DemandJumpResult;
      }>(
        `/api/intent/demand-inbox/${id}/create-prospect`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: draft.name.trim(),
            city: draft.city.trim() || undefined,
            country: draft.country.trim() || undefined,
            industry: draft.industry.trim() || undefined,
          }),
        },
      );
      routeAfterDemandAction(result.factoryJump, result.reviewUrl ?? '/review?kind=demand');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create prospect failed');
    } finally {
      setLoading(null);
    }
  };

  const matchBusiness = async (id: string) => {
    const business = drafts[id]?.business;
    if (!business) {
      setError('Search and select a business to match this signal');
      return;
    }
    setLoading(`match-${id}`);
    setError(null);
    try {
      const result = await api<{ factoryJump?: DemandJumpResult }>(`/api/intent/demand-inbox/${id}/match`, {
        method: 'POST',
        body: JSON.stringify({ businessId: business.id }),
      });
      routeAfterDemandAction(result.factoryJump, '/review?kind=opportunity');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Match failed');
    } finally {
      setLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (initialLoading) {
    return (
      <div className="max-w-4xl space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-52 w-full" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Demand inbox unavailable"
        description={loadError}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      {error && (
        <ErrorState title="Action failed" description={error} onRetry={() => setError(null)} />
      )}

      <p className="text-sm text-ink-muted">
        {total} orphan signal{total === 1 ? '' : 's'} · page {page} of {totalPages}
      </p>

      <BulkSelectionBar count={selectedIds.size} noun="signal" onClear={() => setSelectedIds(new Set())}>
        <BulkActionButton icon={Trash2} label="Dismiss selected" variant="danger" onClick={() => setBulkOpen(true)}>
          Dismiss selected
        </BulkActionButton>
      </BulkSelectionBar>

      <div className="space-y-4">
        {items.map((item) => {
          const draft = drafts[item.id] ?? defaultDraft(item);
          const busy =
            loading === item.id || loading === `create-${item.id}` || loading === `match-${item.id}`;

          return (
            <article
              key={item.id}
              className="space-y-3 rounded-lg border border-line bg-surface p-4 shadow-panel"
            >
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <SelectionCheckbox
                    aria-label={`Select ${item.title || 'signal'}`}
                    checked={selectedIds.has(item.id)}
                    onChange={(event) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (event.target.checked) next.add(item.id);
                        else next.delete(item.id);
                        return next;
                      });
                    }}
                  />
                  <StatusBadge tone="warning">{item.signalType}</StatusBadge>
                  <span className="text-xs text-ink-muted">{item.source}</span>
                  <span className="text-xs text-ink-muted">strength {item.signalStrength}</span>
                  <span className="text-xs text-ink-faint">
                    {new Date(item.capturedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-ink">{item.title || 'Untitled signal'}</h3>
                {item.snippet && (
                  <p className="mt-1 line-clamp-3 text-sm text-ink-muted">{item.snippet}</p>
                )}
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block break-all text-xs text-accent hover:underline"
                  >
                    {item.sourceUrl}
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Business name"
                  value={draft.name}
                  onChange={(e) => updateDraft(item.id, { name: e.target.value })}
                />
                <Input
                  placeholder="Industry (optional)"
                  value={draft.industry}
                  onChange={(e) => updateDraft(item.id, { industry: e.target.value })}
                />
                <Input
                  placeholder="City (optional)"
                  value={draft.city}
                  onChange={(e) => updateDraft(item.id, { city: e.target.value })}
                />
                <Input
                  placeholder="Country (optional)"
                  value={draft.country}
                  onChange={(e) => updateDraft(item.id, { country: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  loading={loading === `create-${item.id}`}
                  disabled={busy || !draft.name.trim()}
                  title={!draft.name.trim() ? 'Add a business name first' : undefined}
                  onClick={() => void createProspect(item.id)}
                >
                  Create prospect
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  loading={loading === item.id}
                  onClick={() => void dismiss(item.id)}
                >
                  Dismiss
                </Button>
              </div>

              <div className="space-y-2 rounded-md border border-line bg-surface-raised p-3">
                <BusinessPicker
                  value={draft.business}
                  disabled={busy}
                  onChange={(business) => updateDraft(item.id, { business })}
                  label="Already discovered? Match instead of creating a duplicate"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy || !draft.business}
                  loading={loading === `match-${item.id}`}
                  title={!draft.business ? 'Select a business to match' : undefined}
                  onClick={() => void matchBusiness(item.id)}
                >
                  Match signal to business
                </Button>
              </div>
            </article>
          );
        })}

        {items.length === 0 && (
          <EmptyState
            title="No orphan demand signals"
            description="Every captured signal is matched or dismissed. Paste a new job post, referral, or help request to add demand."
            action={
              <Button size="sm" asChild>
                <Link href="/intent?tab=capture">Capture a signal</Link>
              </Button>
            }
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => {
              setSelectedIds(new Set());
              setPage((p) => Math.max(1, p - 1));
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-ink-muted">
            Page {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => {
              setSelectedIds(new Set());
              setPage((p) => p + 1);
            }}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title={`Dismiss ${selectedIds.size} signal${selectedIds.size === 1 ? '' : 's'}?`}
        description="Dismissed signals leave the orphan inbox. This action is audited and idempotent for the same key."
      >
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setBulkOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="danger" loading={bulkPending} onClick={() => void bulkDismiss()}>
            Dismiss selected
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
