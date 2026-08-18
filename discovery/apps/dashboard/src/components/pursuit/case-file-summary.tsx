'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { CaseFileResponse, CaseFileUi } from './types';
import { PRESENCE_LABELS } from './types';

function severityTone(severity: 'high' | 'medium' | 'info') {
  if (severity === 'high') return 'danger' as const;
  if (severity === 'medium') return 'warning' as const;
  return 'info' as const;
}

export function CaseFileSummary({
  businessId,
  promoteAllowed,
}: {
  businessId: string;
  promoteAllowed: boolean;
}) {
  const [caseFile, setCaseFile] = useState<CaseFileUi | null>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<CaseFileResponse>(`/api/intelligence/case-file/${businessId}`);
      setCaseFile(data.caseFile);
      setMessage(data.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load Case File summary.');
      setCaseFile(null);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-2 rounded-md border border-line bg-surface-raised p-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState title="Case File summary unavailable" description={error} onRetry={() => void load()} />
    );
  }

  if (!caseFile) {
    return (
      <EmptyState
        title="Intelligence still processing"
        description={message ?? 'Weaknesses appear here after enrichment completes.'}
        className="min-h-32 py-6"
        action={
          <Button size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />
    );
  }

  const weaknesses = caseFile.weaknesses.slice(0, 3);

  return (
    <section className="space-y-3 rounded-md border border-line bg-surface-raised p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Case File summary
        </p>
        <StatusBadge tone={caseFile.presence.class === 'redesign' ? 'info' : 'success'}>
          {PRESENCE_LABELS[caseFile.presence.class]}
        </StatusBadge>
        {caseFile.reachability && (
          <StatusBadge tone="neutral" className="capitalize">
            {caseFile.reachability} reach
          </StatusBadge>
        )}
        <StatusBadge
          tone={
            caseFile.status === 'ready' ? 'success' : caseFile.status === 'partial' ? 'warning' : 'info'
          }
        >
          {caseFile.status === 'ready' ? 'Ready' : caseFile.status === 'partial' ? 'Partial' : 'Processing'}
        </StatusBadge>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Pitch angle</p>
        <p className="mt-1 text-sm leading-5 text-ink">
          {caseFile.pitchAngle ?? 'No pitch angle until enrichment completes.'}
        </p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Top weaknesses
        </p>
        {weaknesses.length ? (
          <ul className="mt-2 space-y-1.5">
            {weaknesses.map((item) => (
              <li key={item.id} className="flex gap-2 text-sm text-ink">
                <StatusBadge tone={severityTone(item.severity)}>{item.severity}</StatusBadge>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">No evidence-backed weaknesses yet.</p>
        )}
      </div>

      <p className="text-xs leading-5 text-ink-muted">
        {promoteAllowed
          ? 'Start pursuit to open the full Case File and generate a channel pitch in Outreach Queue.'
          : 'Full Case File and pitch composer unlock after this opportunity can be promoted.'}
      </p>
    </section>
  );
}
