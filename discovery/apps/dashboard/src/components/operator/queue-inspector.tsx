'use client';

import Link from 'next/link';
import { OpportunityBadge } from '@/components/intelligence/workflow-primitives';
import type { OpportunityCardItem } from '@/components/opportunities/opportunity-card';
import {
  defaultDemandDraft,
  type DemandProspectDraft,
} from '@/components/opportunities/demand-work-card';
import { CaseFileSummary } from '@/components/pursuit/case-file-summary';
import { Button, Input, StatusBadge } from '@/components/ui/primitives';

type DemandItem = {
  id: string;
  source: string;
  signalType: string;
  signalStrength: number;
  title: string | null;
  snippet: string | null;
  sourceUrl: string | null;
  capturedAt: string;
};

type WhatsAppScreening = {
  status: 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked';
  reason: string;
  waMeUrl: string | null;
  normalizedPhone: string | null;
};

const WHATSAPP_LABELS: Record<WhatsAppScreening['status'], { label: string; tone: 'success' | 'info' | 'warning' | 'neutral' }> = {
  wa_ready: { label: 'WhatsApp verified', tone: 'success' },
  wa_probable: { label: 'WhatsApp unconfirmed', tone: 'info' },
  wa_unreliable: { label: 'WhatsApp mismatch', tone: 'warning' },
  wa_blocked: { label: 'No WhatsApp number', tone: 'neutral' },
};

export type QueueInspectorTarget =
  | {
      kind: 'opportunity';
      tierLabel: string;
      priority: number;
      opportunity: OpportunityCardItem & { whatsapp?: WhatsAppScreening };
      promoteAllowed: boolean;
      promoteBlocked?: string;
    }
  | {
      kind: 'demand';
      tierLabel: string;
      priority: number;
      demand: DemandItem;
      draft: DemandProspectDraft;
    };

type QueueInspectorActionsProps = {
  target: QueueInspectorTarget | null;
  loading: boolean;
  onStartPursuit?: () => void;
  onDismissOpportunity?: () => void;
  onSuppressOpportunity?: () => void;
  onCreateProspect?: () => void;
  onMatchDemand?: () => void;
  onDismissDemand?: () => void;
};

export function QueueInspectorActions({
  target,
  loading,
  onStartPursuit,
  onDismissOpportunity,
  onSuppressOpportunity,
  onCreateProspect,
  onMatchDemand,
  onDismissDemand,
}: QueueInspectorActionsProps) {
  if (!target) return null;

  if (target.kind === 'demand') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" loading={loading} onClick={onCreateProspect}>
          Create prospect
        </Button>
        <Button size="sm" variant="secondary" loading={loading} onClick={onMatchDemand}>
          Match
        </Button>
        <Button size="sm" variant="ghost" loading={loading} onClick={onDismissDemand}>
          Dismiss
        </Button>
      </div>
    );
  }

  const item = target.opportunity;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="primary"
        disabled={!target.promoteAllowed}
        loading={loading}
        onClick={onStartPursuit}
      >
        Start pursuit
      </Button>
      <Button size="sm" variant="secondary" loading={loading} onClick={onDismissOpportunity}>
        Dismiss
      </Button>
      <Button size="sm" variant="danger" loading={loading} onClick={onSuppressOpportunity}>
        Suppress
      </Button>
      <Button size="sm" variant="ghost" asChild>
        <Link href={`/discovery/${item.run.id}`}>Open run</Link>
      </Button>
    </div>
  );
}

type QueueInspectorProps = {
  target: QueueInspectorTarget | null;
  loading: boolean;
  onDraftChange?: (draft: DemandProspectDraft) => void;
};

export function QueueInspector({ target, loading, onDraftChange }: QueueInspectorProps) {
  if (!target) {
    return (
      <div className="space-y-3 text-sm text-ink-muted">
        <p>Select a row to inspect evidence and take the next triage action.</p>
        <p className="text-xs">
          Keyboard: <kbd className="rounded border border-line px-1">j</kbd>/
          <kbd className="rounded border border-line px-1">k</kbd> move ·{' '}
          <kbd className="rounded border border-line px-1">Enter</kbd> inspect ·{' '}
          <kbd className="rounded border border-line px-1">p</kbd> promote ·{' '}
          <kbd className="rounded border border-line px-1">d</kbd> dismiss ·{' '}
          <kbd className="rounded border border-line px-1">x</kbd> suppress
        </p>
      </div>
    );
  }

  if (target.kind === 'demand') {
    const draft = target.draft ?? defaultDemandDraft(target.demand);
    return (
      <div className="space-y-4">
        <header className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="warning">{target.tierLabel}</StatusBadge>
            <StatusBadge tone="neutral">Priority {target.priority}</StatusBadge>
            <StatusBadge tone="info">{target.demand.signalType}</StatusBadge>
          </div>
          <h3 className="text-base font-semibold text-ink">
            {target.demand.title || 'Untitled demand signal'}
          </h3>
          <p className="text-xs text-ink-muted">
            {target.demand.source} · strength {target.demand.signalStrength}
          </p>
        </header>
        {target.demand.snippet && (
          <p className="text-sm text-ink-muted line-clamp-6">{target.demand.snippet}</p>
        )}
        {target.demand.sourceUrl && (
          <a
            href={target.demand.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-xs text-accent hover:underline"
          >
            {target.demand.sourceUrl}
          </a>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ['name', 'Business name'],
              ['industry', 'Industry'],
              ['city', 'City'],
              ['country', 'Country'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="space-y-1 text-xs font-medium text-ink-muted">
              {label}
              <Input
                value={draft[key]}
                onChange={(event) => onDraftChange?.({ ...draft, [key]: event.target.value })}
              />
            </label>
          ))}
          <label className="space-y-1 text-xs font-medium text-ink-muted sm:col-span-2">
            Match business UUID
            <Input
              value={draft.businessId}
              onChange={(event) => onDraftChange?.({ ...draft, businessId: event.target.value })}
              placeholder="Optional existing business id"
            />
          </label>
        </div>
      </div>
    );
  }

  const item = target.opportunity;
  const laneTier =
    item.opportunityType === 'greenfield' || item.opportunityType === 'demand_response'
      ? 'sure-deal'
      : item.opportunityType === 'redesign' || item.opportunityType === 'modernize'
        ? 'redesign'
        : 'watch';

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <OpportunityBadge tier={laneTier} />
          <StatusBadge tone={item.verified ? 'success' : 'warning'}>
            {item.verified ? 'Verified' : 'Unverified'}
          </StatusBadge>
          <StatusBadge tone="neutral">{target.tierLabel}</StatusBadge>
          <StatusBadge tone="info">Score {item.score}</StatusBadge>
        </div>
        <h3 className="text-base font-semibold text-ink">{item.business.name}</h3>
        <p className="text-xs text-ink-muted">
          {[item.business.city, item.run.industry, item.run.city].filter(Boolean).join(' · ')}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-ink-muted">Reachability</dt>
          <dd className="font-medium capitalize text-ink">{item.reachability}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Presence</dt>
          <dd className="font-medium text-ink">{item.opportunityTypeLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Email</dt>
          <dd className="truncate text-ink">{item.business.email || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Phone / WhatsApp</dt>
          <dd className="truncate text-ink">
            {item.whatsapp?.normalizedPhone || item.business.phone || '—'}
          </dd>
        </div>
      </dl>

      {item.whatsapp && (
        <div className="space-y-1 rounded-md border border-line bg-surface-raised p-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={WHATSAPP_LABELS[item.whatsapp.status].tone}>
              {WHATSAPP_LABELS[item.whatsapp.status].label}
            </StatusBadge>
            {item.whatsapp.waMeUrl && (
              <a
                href={item.whatsapp.waMeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-accent hover:underline"
              >
                Open wa.me
              </a>
            )}
          </div>
          <p className="text-xs text-ink-muted">{item.whatsapp.reason}</p>
        </div>
      )}

      {item.positiveFactors.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Evidence</p>
          <ul className="space-y-1 text-sm text-ink-muted">
            {item.positiveFactors.slice(0, 5).map((factor) => (
              <li key={factor.key}>
                {factor.label}
                {factor.value ? ` (+${factor.value})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.blockers.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Blockers</p>
          <ul className="space-y-1 text-sm text-warning-foreground">
            {item.blockers.slice(0, 4).map((factor) => (
              <li key={factor.key}>{factor.label}</li>
            ))}
          </ul>
        </div>
      )}

      <CaseFileSummary businessId={item.business.id} promoteAllowed={target.promoteAllowed} />

      {!target.promoteAllowed && target.promoteBlocked && (
        <p className="rounded-md border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
          {target.promoteBlocked}
        </p>
      )}
    </div>
  );
}
