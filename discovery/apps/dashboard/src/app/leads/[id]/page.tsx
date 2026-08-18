'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { MarkRepliedForm } from '@/components/MarkRepliedForm';
import { ReplySuggestionsPanel } from '@/components/ReplySuggestionsPanel';
import { PursuitWorkspace } from '@/components/pursuit';
import type { DraftChannel } from '@/components/pursuit';
import { SendToCrmButton } from '@/components/crm/send-to-crm-button';
import { PageHeader } from '@/components/layout/page-header';
import { Button, Dialog, EmptyState, Input, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';
import { useSearchParams } from 'next/navigation';

type Tab = 'overview' | 'timeline' | 'proposals' | 'signals';

type LeadHub = {
  lead: {
    id: string;
    accountId: string;
    status: string;
    priority: string;
    nextFollowUpAt: string | null;
  };
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    website: string | null;
  };
  analysis: {
    hasWebsite: boolean;
    httpsEnabled: boolean | null;
    mobileFriendly: boolean | null;
    notes: string | null;
  } | null;
  notes: { id: string; content: string; createdAt: string }[];
  activities: { id: string; type: string; description: string; createdAt: string }[];
  signals: {
    id: string;
    signalType: string;
    signalClass?: string;
    signalStrength: number;
    title: string | null;
    snippet: string | null;
  }[];
  outreach: {
    id: string;
    subject: string | null;
    body: string;
    channel: string;
    sentAt: string | null;
  }[];
  proposals: {
    id: string;
    title: string;
    amount: string | number;
    status: string;
  }[];
  allowedTransitions: string[];
  suppression: { suppressed: boolean; source: 'account' | 'list' | null } | null;
  gmailConnected?: boolean;
  replySuggestions?: Array<{
    id: string;
    subject: string | null;
    snippet: string | null;
    fromEmail: string | null;
    receivedAt: string | null;
  }>;
  crmBridge?: {
    configured: boolean;
    lastPushAt: string | null;
    lastPushStatus: string | null;
  };
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'signals', label: 'Signals' },
];

export default function LeadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const rawChannel = searchParams.get('channel') ?? 'email';
  const composeChannel: DraftChannel = ['email', 'whatsapp', 'phone', 'follow_up'].includes(rawChannel)
    ? (rawChannel as DraftChannel)
    : 'email';
  const [data, setData] = useState<LeadHub | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [note, setNote] = useState('');
  const [proposalAmount, setProposalAmount] = useState('5000');
  const [proposalPackageId, setProposalPackageId] = useState('');
  const [agencyPackages, setAgencyPackages] = useState<
    Array<{ id: string; title: string; priceUgx: number; depositUgx?: number }>
  >([]);
  const [agencyCurrency, setAgencyCurrency] = useState('UGX');
  const [autoQualify, setAutoQualify] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [closeLostOpen, setCloseLostOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api<LeadHub>(`/api/crm/leads/${id}`)
      .then((hub) => {
        setData(hub);
        setLoadError(null);
      })
      .catch((reason) => {
        setLoadError(reason instanceof Error ? reason.message : 'Failed to load lead');
      });

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    void api<{
      currency: string;
      packages: Array<{ id: string; title: string; priceUgx: number; depositUgx?: number }>;
    }>('/api/proposals/packages')
      .then((data) => {
        setAgencyPackages(data.packages ?? []);
        setAgencyCurrency(data.currency ?? 'UGX');
        if (data.packages?.[0]) {
          setProposalPackageId(data.packages[0].id);
          setProposalAmount(String(data.packages[0].priceUgx));
        }
      })
      .catch(() => undefined);
  }, []);

  const timeline = useMemo(() => {
    if (!data) return [];
    const noteEvents = data.notes.map((entry) => ({
      id: `note-${entry.id}`,
      kind: 'note' as const,
      label: entry.content,
      at: entry.createdAt,
    }));
    const activityEvents = data.activities.map((entry) => ({
      id: `act-${entry.id}`,
      kind: 'activity' as const,
      label: entry.description,
      at: entry.createdAt,
    }));
    const outreachEvents = data.outreach.map((entry) => ({
      id: `out-${entry.id}`,
      kind: 'outreach' as const,
      label: `${entry.channel.toUpperCase()}: ${entry.subject || entry.body.slice(0, 80)}`,
      at: entry.sentAt ?? '',
    }));
    return [...noteEvents, ...activityEvents, ...outreachEvents]
      .filter((event) => event.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [data]);

  const transition = async (toStatus: string, transitionNote?: string) => {
    setBusy(true);
    try {
      await api(`/api/crm/leads/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus, note: transitionNote }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const closeLost = async () => {
    const reason = lossReason.trim();
    if (!reason) return;
    setBusy(true);
    try {
      await api(`/api/crm/leads/${id}/close-lost`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setLossReason('');
      setCloseLostOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await api(`/api/crm/leads/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: note }),
      });
      setNote('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const createProposal = async () => {
    setProposalError('');
    setBusy(true);
    try {
      await api('/api/proposals', {
        method: 'POST',
        body: JSON.stringify({
          leadId: id,
          title: proposalPackageId
            ? `${agencyPackages.find((p) => p.id === proposalPackageId)?.title ?? 'Package'} — ${data?.business.name}`
            : `Web development proposal — ${data?.business.name}`,
          amount: Number(proposalAmount),
          packageId: proposalPackageId || undefined,
          autoQualify,
        }),
      });
      await load();
      setTab('proposals');
    } catch (e) {
      setProposalError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const sendProposal = async (proposalId: string) => {
    setProposalError('');
    setBusy(true);
    try {
      await api(`/api/proposals/${proposalId}/send`, { method: 'POST' });
      await load();
    } catch (e) {
      setProposalError(String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loadError && !data) {
    return (
      <EmptyState
        title="Lead unavailable"
        description={loadError}
        action={
          <Button size="sm" onClick={() => void load()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const canMarkReplied = data.lead.status === 'CONTACTED' || data.lead.status === 'NO_RESPONSE';
  const canCloseLost = data.allowedTransitions.includes('CLOSED_LOST');
  const canCreateProposal =
    data.lead.status === 'QUALIFIED' || (data.lead.status === 'REPLIED' && autoQualify);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/leads" className="text-sm text-accent hover:underline">
            ← {PAGE_COPY.pursuits.title}
          </Link>
          <PageHeader compact title={data.business.name} />
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone="info">{data.lead.status}</StatusBadge>
            <StatusBadge tone="neutral">Priority {data.lead.priority}</StatusBadge>
            {data.lead.nextFollowUpAt && (
              <StatusBadge tone="warning">
                Follow-up {new Date(data.lead.nextFollowUpAt).toLocaleDateString()}
              </StatusBadge>
            )}
            {data.suppression?.suppressed && (
              <StatusBadge tone="danger">
                {data.suppression.source === 'account' ? 'Account suppressed' : 'On suppression list'}
              </StatusBadge>
            )}
          </div>
        </div>
        {data.lead.accountId && (
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/data-quality?accountId=${encodeURIComponent(data.lead.accountId)}`}>
              Check duplicates
            </Link>
          </Button>
        )}
      </div>

      <PursuitWorkspace
        leadId={id}
        defaultChannel={composeChannel}
        onOutreachRecorded={() => void load()}
      />

      <div className="flex flex-wrap gap-1 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === item.id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {item.label}
            {item.id === 'timeline' && timeline.length > 0 && (
              <span className="ml-1 text-xs">({timeline.length})</span>
            )}
            {item.id === 'proposals' && data.proposals.length > 0 && (
              <span className="ml-1 text-xs">({data.proposals.length})</span>
            )}
            {item.id === 'signals' && data.signals.length > 0 && (
              <span className="ml-1 text-xs">({data.signals.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tab === 'overview' && (
            <>
              {data.gmailConnected && data.replySuggestions && (
                <ReplySuggestionsPanel leadId={id} suggestions={data.replySuggestions} onDone={load} />
              )}
              {canMarkReplied && <MarkRepliedForm leadId={id} onDone={load} />}
              <section className="rounded-lg border border-line bg-surface p-4 shadow-panel">
                <h3 className="mb-2 text-sm font-semibold text-ink">Operator note</h3>
                <div className="mb-3 flex gap-2">
                  <Input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add a note…"
                  />
                  <Button size="sm" loading={busy} onClick={() => void addNote()}>
                    Add
                  </Button>
                </div>
                <ul className="space-y-2 text-sm text-ink-muted">
                  {data.notes.map((entry) => (
                    <li key={entry.id} className="border-l-2 border-line pl-3">
                      {entry.content}
                    </li>
                  ))}
                  {data.notes.length === 0 && <li className="italic text-ink-faint">No notes yet.</li>}
                </ul>
              </section>
            </>
          )}

          {tab === 'timeline' && (
            <section className="rounded-lg border border-line bg-surface p-4 shadow-panel">
              <h3 className="mb-3 text-sm font-semibold text-ink">Activity timeline</h3>
              {timeline.length === 0 ? (
                <p className="text-sm italic text-ink-faint">No activity recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {timeline.map((event) => (
                    <li key={event.id} className="border-l-2 border-line pl-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={event.kind === 'outreach' ? 'info' : 'neutral'}>
                          {event.kind}
                        </StatusBadge>
                        <span className="text-xs text-ink-faint">
                          {new Date(event.at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-ink">{event.label}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === 'proposals' && (
            <section className="space-y-3 rounded-lg border border-line bg-surface p-4 shadow-panel">
              <h3 className="font-medium text-ink">Proposals</h3>
              {proposalError && <p className="text-sm text-danger">{proposalError}</p>}
              {data.proposals.length === 0 && (
                <p className="text-sm italic text-ink-faint">No proposals yet.</p>
              )}
              {data.proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-start justify-between gap-3 rounded border border-line p-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{proposal.title}</p>
                    <p className="text-ink-muted">{proposal.status}</p>
                    {proposal.status === 'draft' && data.lead.status === 'QUALIFIED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        loading={busy}
                        onClick={() => void sendProposal(proposal.id)}
                      >
                        Mark proposal sent
                      </Button>
                    )}
                    {proposal.status === 'draft' && data.lead.status !== 'QUALIFIED' && (
                      <p className="mt-1 text-xs text-warning-foreground">Qualify lead before sending</p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold text-accent">
                    ${Number(proposal.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </section>
          )}

          {tab === 'signals' && (
            <section className="space-y-2 rounded-lg border border-line bg-surface p-4 shadow-panel">
              <h3 className="mb-2 font-medium text-ink">Intent signals</h3>
              {data.signals.length === 0 && (
                <p className="text-sm italic text-ink-faint">No signals linked to this business.</p>
              )}
              {data.signals.map((signal) => (
                <div
                  key={signal.id}
                  className="rounded border border-line bg-surface-raised px-3 py-2 text-sm"
                >
                  <strong>{signal.title ?? signal.signalType}</strong> ({signal.signalStrength})
                  <span className="ml-1 text-ink-muted">
                    · {signal.signalClass === 'demand' ? 'demand' : 'enrichment'}
                  </span>
                  {signal.snippet && <p className="mt-1 text-ink-muted">{signal.snippet}</p>}
                </div>
              ))}
              {data.analysis && (
                <div className="mt-4 border-t border-line pt-3 text-sm text-ink-muted">
                  <p>
                    Website detected:{' '}
                    <strong className="text-ink">{data.analysis.hasWebsite ? 'Yes' : 'No'}</strong>
                  </p>
                  <p className="mt-1">
                    HTTPS:{' '}
                    {data.analysis.httpsEnabled == null
                      ? 'Unknown'
                      : data.analysis.httpsEnabled
                        ? 'Enabled'
                        : 'Missing'}
                  </p>
                  <p className="mt-1">
                    Mobile friendly:{' '}
                    {data.analysis.mobileFriendly == null
                      ? 'Unknown'
                      : data.analysis.mobileFriendly
                        ? 'Yes'
                        : 'No'}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="sticky-below-header space-y-4 self-start">
          <section className="rounded-lg border border-line bg-surface p-4 shadow-panel">
            <h3 className="mb-3 font-medium text-ink">Advance status</h3>
            <select
              className="mb-2 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
              value=""
              disabled={busy}
              onChange={(event) => {
                if (event.target.value) void transition(event.target.value);
                event.target.value = '';
              }}
            >
              <option value="">Change status…</option>
              {data.allowedTransitions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {data.allowedTransitions.length === 0 && (
              <p className="text-xs text-ink-muted">No further transitions available.</p>
            )}
          </section>

          <section className="rounded-lg border border-line bg-surface p-4 shadow-panel">
            <h3 className="mb-3 font-medium text-ink">SleeklyBuilt CRM</h3>
            <SendToCrmButton
              leadId={id}
              configured={data.crmBridge?.configured ?? false}
              lastPushAt={data.crmBridge?.lastPushAt}
              onDone={load}
            />
          </section>

          {canCloseLost && (
            <section className="rounded-lg border border-danger/30 bg-surface p-4 shadow-panel">
              <h3 className="mb-2 font-medium text-danger">Close lost</h3>
              <Button size="sm" variant="danger" className="w-full" onClick={() => setCloseLostOpen(true)}>
                Mark CLOSED_LOST
              </Button>
            </section>
          )}

          <section className="rounded-lg border border-line bg-surface p-4 shadow-panel">
            <h3 className="mb-2 font-medium text-ink">Create proposal</h3>
            <p className="mb-2 text-xs text-ink-muted">
              Requires QUALIFIED, or REPLIED with auto-qualify.
            </p>
            {data.lead.status === 'REPLIED' && (
              <label className="mb-2 flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={autoQualify}
                  onChange={(event) => setAutoQualify(event.target.checked)}
                />
                Auto-qualify (REPLIED → QUALIFIED)
              </label>
            )}
            {agencyPackages.length > 0 && (
              <label className="mb-2 block space-y-1 text-xs text-ink-muted">
                Package preset
                <select
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
                  value={proposalPackageId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setProposalPackageId(nextId);
                    const pkg = agencyPackages.find((p) => p.id === nextId);
                    if (pkg) setProposalAmount(String(pkg.priceUgx));
                  }}
                >
                  {agencyPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title} · {agencyCurrency} {pkg.priceUgx.toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Input
              type="number"
              className="mb-2"
              value={proposalAmount}
              onChange={(event) => {
                setProposalAmount(event.target.value);
                setProposalPackageId('');
              }}
            />
            {proposalError && <p className="mb-2 text-xs text-danger">{proposalError}</p>}
            <Button
              size="sm"
              className="w-full"
              disabled={!canCreateProposal}
              loading={busy}
              onClick={() => void createProposal()}
            >
              Create proposal
            </Button>
          </section>
        </aside>
      </div>

      <Dialog
        open={closeLostOpen}
        onOpenChange={setCloseLostOpen}
        title="Close this pursuit as lost?"
        description="Provide a loss reason for the audit trail. This cannot be undone from this dialog."
      >
        <div className="space-y-3">
          <Input
            value={lossReason}
            onChange={(event) => setLossReason(event.target.value)}
            placeholder="Loss reason"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setCloseLostOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={!lossReason.trim()}
              loading={busy}
              onClick={() => void closeLost()}
            >
              Confirm close lost
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
