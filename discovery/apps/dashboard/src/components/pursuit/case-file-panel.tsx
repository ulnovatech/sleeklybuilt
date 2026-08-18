'use client';

import Link from 'next/link';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { CaseFileUi } from './types';
import { PRESENCE_LABELS } from './types';

function severityTone(severity: 'high' | 'medium' | 'info') {
  if (severity === 'high') return 'danger' as const;
  if (severity === 'medium') return 'warning' as const;
  return 'info' as const;
}

function evidenceById(caseFile: CaseFileUi) {
  return new Map(caseFile.evidence.map((item) => [item.id, item]));
}

export function CaseFilePanel({
  caseFile,
  loading,
  error,
  message,
  onRetry,
}: {
  caseFile: CaseFileUi | null;
  loading: boolean;
  error: string | null;
  message?: string;
  onRetry: () => void;
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const evidenceMap = useMemo(() => (caseFile ? evidenceById(caseFile) : new Map()), [caseFile]);

  if (loading) {
    return (
      <div className="space-y-3 rounded-lg border border-line bg-surface p-4 shadow-panel">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState title="Case File could not load" description={error} onRetry={onRetry} />
    );
  }

  if (!caseFile) {
    return (
      <EmptyState
        title="Case File is still processing"
        description={
          message ??
          'Intelligence enrichment is still running. Refresh when the discovery pipeline completes.'
        }
        action={
          <Button size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />
    );
  }

  const readiness = caseFile.purchaseReadiness;
  const complaints = caseFile.sentiment?.complaintThemes ?? [];

  return (
    <section className="rounded-lg border border-line bg-surface shadow-panel">
      <header className="border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">Case File</h3>
          <StatusBadge tone={caseFile.presence.class === 'redesign' ? 'info' : 'success'}>
            {PRESENCE_LABELS[caseFile.presence.class]}
          </StatusBadge>
          <StatusBadge
            tone={
              caseFile.status === 'ready'
                ? 'success'
                : caseFile.status === 'partial' || caseFile.status === 'blocked'
                  ? 'warning'
                  : 'info'
            }
          >
            {caseFile.status === 'ready'
              ? 'Evidence ready'
              : caseFile.status === 'partial'
                ? 'Partial intelligence'
                : caseFile.status === 'blocked'
                  ? 'Suppressed'
                  : 'Processing'}
          </StatusBadge>
          {caseFile.score != null && (
            <StatusBadge tone="neutral">Score {caseFile.score}</StatusBadge>
          )}
          {caseFile.reachability && (
            <StatusBadge tone="neutral" className="capitalize">
              {caseFile.reachability} reachability
            </StatusBadge>
          )}
        </div>
        {caseFile.status === 'blocked' && (
          <p className="mt-2 rounded-md border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger-foreground">
            {message ?? 'This account is suppressed — pitch generation is blocked.'}
          </p>
        )}
        {caseFile.status === 'partial' && (
          <p className="mt-2 rounded-md border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
            Limited evidence — pitches will stay conservative until enrichment completes.
          </p>
        )}
      </header>

      <div className="space-y-5 p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Pitch angle</p>
          <p className="mt-1 text-sm leading-6 text-ink">
            {caseFile.pitchAngle ?? 'No pitch angle until enrichment completes.'}
          </p>
        </div>

        {caseFile.executiveSummary && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Summary</p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{caseFile.executiveSummary}</p>
          </div>
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Weaknesses & gaps
          </p>
          {caseFile.weaknesses.length || caseFile.pains.length || caseFile.websiteGaps.length ? (
            <ul className="mt-2 space-y-2">
              {caseFile.weaknesses.map((item) => {
                const excerpt = item.evidenceIds
                  .map((id) => evidenceMap.get(id)?.excerpt)
                  .find(Boolean);
                return (
                  <li
                    key={item.id}
                    className="rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={severityTone(item.severity)}>{item.severity}</StatusBadge>
                      <span>{item.label}</span>
                    </div>
                    {excerpt && (
                      <p className="mt-1 text-xs leading-5 text-ink-muted">&ldquo;{excerpt}&rdquo;</p>
                    )}
                  </li>
                );
              })}
              {caseFile.pains
                .filter((pain) => !caseFile.weaknesses.some((w) => w.label === pain.label))
                .map((pain) => (
                  <li
                    key={pain.id}
                    className="rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone="info">pain</StatusBadge>
                      <span>{pain.label}</span>
                      <span className="text-xs text-ink-faint">
                        {Math.round(pain.confidence * 100)}% conf.
                      </span>
                    </div>
                  </li>
                ))}
              {caseFile.websiteGaps.map((gap) => (
                <li
                  key={gap.key}
                  className="rounded-md border border-dashed border-line px-3 py-2 text-sm text-ink-muted"
                >
                  <StatusBadge tone={severityTone(gap.severity)}>{gap.severity}</StatusBadge>{' '}
                  {gap.label}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-2 min-h-0 border-dashed py-6"
              title="No weaknesses found"
              description="Enrichment did not surface evidence-backed gaps yet. Refresh after the discovery pipeline, or suppress if this is not a fit."
              action={
                <Button size="sm" variant="secondary" onClick={onRetry}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh Case File
                </Button>
              }
            />
          )}
        </div>

        {caseFile.recommendedServices.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Recommended services
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {caseFile.recommendedServices.map((service) => (
                <StatusBadge key={service} tone="info">
                  {service}
                </StatusBadge>
              ))}
            </div>
          </div>
        )}

        {readiness && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Purchase readiness
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge tone={readiness.band === 'high' ? 'success' : readiness.band === 'medium' ? 'warning' : 'neutral'}>
                {readiness.band}
                {readiness.score != null ? ` · ${readiness.score}` : ''}
              </StatusBadge>
              {readiness.factors.slice(0, 2).map((factor) => (
                <span key={factor.key} className="text-xs text-ink-muted">
                  {factor.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {complaints.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Sentiment hooks
            </p>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {complaints.slice(0, 3).map((theme) => (
                <li key={theme.id}>
                  {theme.label}
                  {theme.sampleExcerpt ? (
                    <span className="block text-xs text-ink-muted">&ldquo;{theme.sampleExcerpt}&rdquo;</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {caseFile.evidence.length > 0 && (
          <div className="rounded-md border border-line">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ink hover:bg-surface-raised"
              onClick={() => setEvidenceOpen((open) => !open)}
              aria-expanded={evidenceOpen}
            >
              Evidence ({caseFile.evidence.length})
              <ChevronDown className={cn('h-4 w-4 transition-transform', evidenceOpen && 'rotate-180')} />
            </button>
            {evidenceOpen && (
              <ul className="max-h-48 space-y-2 overflow-y-auto border-t border-line px-3 py-2">
                {caseFile.evidence.map((item) => (
                  <li key={item.id} className="text-xs text-ink-muted">
                    <span className="font-medium text-ink">{item.label}</span>
                    {item.excerpt && <p className="mt-0.5">{item.excerpt}</p>}
                    {item.url && (
                      <Link href={item.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        Source
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
