'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button, EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { PAGE_COPY } from '@/lib/product-copy';

type Proposal = {
  id: string;
  leadId: string;
  title: string;
  amount: number;
  status: string;
  businessName: string;
  leadStatus: string;
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () =>
    api<{ proposals: Proposal[] }>('/api/proposals')
      .then((d) => {
        setProposals(d.proposals);
        setError('');
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });

  useEffect(() => {
    void load();
  }, []);

  const send = async (id: string) => {
    setBusyId(id);
    setError('');
    try {
      await api(`/api/proposals/${id}/send`, { method: 'POST' });
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={PAGE_COPY.proposals.title} description={PAGE_COPY.proposals.description} />
        <Button size="sm" variant="secondary" asChild>
          <Link href="/leads?status=QUALIFIED">Open qualified pipeline</Link>
        </Button>
      </div>

      {error && (
        <ErrorState title="Proposals issue" description={error} onRetry={() => void load()} />
      )}

      {proposals === null && <Skeleton className="h-48 w-full" />}

      {proposals && proposals.length === 0 && (
        <EmptyState
          title="No proposals yet"
          description="Create a proposal from a QUALIFIED lead. Pitch Pack facts stay on the lead hub."
          action={
            <Button size="sm" asChild>
              <Link href="/leads?status=QUALIFIED">Open qualified pursuits</Link>
            </Button>
          }
        />
      )}

      {proposals && proposals.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-ink-muted">
              <tr>
                <th className="p-3 font-medium">Business</th>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Lead</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id} className="border-t border-line">
                  <td className="p-3">
                    <Link href={`/leads/${proposal.leadId}`} className="text-accent hover:underline">
                      {proposal.businessName}
                    </Link>
                  </td>
                  <td className="p-3 text-ink">{proposal.title}</td>
                  <td className="p-3 tabular-nums text-ink">
                    ${Number(proposal.amount).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge tone={proposal.status === 'draft' ? 'warning' : 'success'}>
                      {proposal.status}
                    </StatusBadge>
                  </td>
                  <td className="p-3 text-ink-muted">{proposal.leadStatus}</td>
                  <td className="p-3 text-right">
                    {proposal.status === 'draft' && proposal.leadStatus === 'QUALIFIED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={busyId === proposal.id}
                        onClick={() => void send(proposal.id)}
                      >
                        Mark sent
                      </Button>
                    )}
                    {proposal.status === 'draft' && proposal.leadStatus !== 'QUALIFIED' && (
                      <span className="text-xs text-warning-foreground">Qualify lead first</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
