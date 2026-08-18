'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button, EmptyState, ErrorState, Input, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';

type Summary = {
  mtd: number;
  total: number;
  dealCount: number;
  retainerCount: number;
  records: { id: string; amount: number; type: string; closedAt: string; proposalId: string | null }[];
};

type CloseableDeal = {
  lead: { id: string; status: string };
  business: { name: string };
  proposal: { id: string; amount: number; title: string } | null;
};

export default function RevenuePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [deals, setDeals] = useState<CloseableDeal[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    leadId: '',
    proposalId: '',
    clientName: '',
    amount: '5000',
    type: 'one_time' as 'one_time' | 'retainer',
  });

  const load = () => {
    api<Summary>('/api/revenue').then(setSummary);
    api<{ deals: CloseableDeal[] }>('/api/revenue/closeable').then((d) => setDeals(d.deals));
  };

  useEffect(() => {
    load();
  }, []);

  const closeDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/revenue', {
        method: 'POST',
        body: JSON.stringify({
          leadId: form.leadId,
          proposalId: form.proposalId || undefined,
          clientName: form.clientName,
          amount: Number(form.amount),
          type: form.type,
        }),
      });
      await load();
      setForm({ leadId: '', proposalId: '', clientName: '', amount: '5000', type: 'one_time' });
    } catch (err) {
      setError(String(err));
    }
  };

  const selectDeal = (deal: CloseableDeal) => {
    setForm({
      ...form,
      leadId: deal.lead.id,
      proposalId: deal.proposal?.id ?? '',
      clientName: deal.business.name,
      amount: String(deal.proposal?.amount ?? form.amount),
    });
  };

  if (!summary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader compact title={PAGE_COPY.revenue.title} description={PAGE_COPY.revenue.description} />
        <Button size="sm" variant="secondary" asChild>
          <Link href="/ops">Today</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" asChild>
          <Link href="/proposals">Proposals</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/leads">Pipeline</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-line bg-surface p-4 shadow-panel">
          <p className="text-xs text-ink-muted">MTD</p>
          <p className="text-2xl font-semibold text-ink">${summary.mtd.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 shadow-panel">
          <p className="text-xs text-ink-muted">All time</p>
          <p className="text-2xl font-semibold text-ink">${summary.total.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 shadow-panel">
          <p className="text-xs text-ink-muted">Deals</p>
          <p className="text-2xl font-semibold text-ink">{summary.dealCount}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 shadow-panel">
          <p className="text-xs text-ink-muted">Retainers</p>
          <p className="text-2xl font-semibold text-ink">{summary.retainerCount}</p>
        </div>
      </div>

      {error && <ErrorState title="Could not record deal" description={error} />}

      <form onSubmit={closeDeal} className="grid grid-cols-1 gap-4 rounded-lg border border-line bg-surface p-4 shadow-panel sm:grid-cols-2">
        <h3 className="font-medium text-ink sm:col-span-2">Close deal (PROPOSAL_SENT only)</h3>
        <select
          className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink sm:col-span-2"
          value={form.leadId}
          onChange={(e) => {
            const deal = deals.find((d) => d.lead.id === e.target.value);
            if (deal) selectDeal(deal);
            else setForm({ ...form, leadId: e.target.value });
          }}
          required
        >
          <option value="">Select lead with sent proposal…</option>
          {deals.map((d) => (
            <option key={d.lead.id} value={d.lead.id}>
              {d.business.name}
              {d.proposal ? ` — $${Number(d.proposal.amount).toLocaleString()}` : ''}
            </option>
          ))}
        </select>
        {deals.length === 0 && (
          <p className="text-sm italic text-ink-faint sm:col-span-2">
            No PROPOSAL_SENT leads. Send a proposal from the Proposals page first.
          </p>
        )}
        <Input
          placeholder="Client name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          required
        />
        <Input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select
          className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as 'one_time' | 'retainer' })}
        >
          <option value="one_time">One-time</option>
          <option value="retainer">Retainer</option>
        </select>
        {form.proposalId && (
          <p className="text-xs text-ink-muted sm:col-span-2">
            Linked proposal: {form.proposalId.slice(0, 8)}…
          </p>
        )}
        <Button type="submit" className="sm:col-span-2" disabled={deals.length === 0}>
          Record closed deal → CLOSED_WON
        </Button>
      </form>

      {summary.records.length === 0 ? (
        <EmptyState title="No closed revenue yet" description="Record your first won deal above to start tracking proof." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-[11px] uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="p-3 font-semibold">Amount</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Proposal</th>
                <th className="p-3 font-semibold">Closed</th>
              </tr>
            </thead>
            <tbody>
              {summary.records.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="p-3 font-medium tabular-nums text-ink">${r.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <StatusBadge tone={r.type === 'retainer' ? 'info' : 'neutral'}>{r.type}</StatusBadge>
                  </td>
                  <td className="p-3 text-ink-muted">
                    {r.proposalId ? (
                      <Link href="/proposals" className="text-accent hover:underline">
                        linked
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-ink-muted">{new Date(r.closedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
