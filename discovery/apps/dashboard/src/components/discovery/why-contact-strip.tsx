'use client';

import {
  buildWhyContactScan,
  contactabilityTone,
  websiteClassTone,
} from '@agency/discovery/why-contact';
import { StatusBadge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

export type WhyContactStripProps = {
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
  scoreFactors?: Record<string, number> | null;
  analysisHasWebsite?: boolean | null;
  /** compact = pitch-today row; default = run card */
  density?: 'default' | 'compact';
  className?: string;
};

/**
 * Operator scan block: website class + contactability + why-contact + top evidence facts.
 * Design OS: dashboard/crm scan → act without opening raw JSON.
 */
export function WhyContactStrip({
  website,
  phone,
  email,
  metadata,
  scoreFactors,
  analysisHasWebsite,
  density = 'default',
  className,
}: WhyContactStripProps) {
  const scan = buildWhyContactScan({
    website,
    phone,
    email,
    metadata,
    scoreFactors,
    analysisHasWebsite,
  });

  const compact = density === 'compact';

  return (
    <div
      className={cn(compact ? 'mt-1 space-y-0.5' : 'mt-3 space-y-2', className)}
      data-testid="why-contact-strip"
    >
      {compact ? (
        <p className="text-[11px] leading-snug text-ink-muted">
          <span className="font-medium text-ink">{scan.websiteClassLabel}</span>
          <span className="mx-1 text-ink-faint">·</span>
          <span className="font-medium text-ink">{scan.contactabilityLabel}</span>
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={websiteClassTone(scan.websiteClass)}>{scan.websiteClassLabel}</StatusBadge>
          <StatusBadge tone={contactabilityTone(scan.contactability)}>
            {scan.contactabilityLabel}
          </StatusBadge>
        </div>
      )}

      <div>
        {!compact ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Why contact
          </p>
        ) : null}
        <p
          className={cn(
            'leading-snug text-ink',
            compact ? 'line-clamp-2 text-xs text-ink-muted' : 'mt-0.5 text-xs',
          )}
          title={scan.whyContact}
        >
          {compact ? <span className="font-medium text-ink">Why: </span> : null}
          {scan.whyContact}
        </p>
      </div>

      {scan.evidenceFacts.length > 0 ? (
        <ul
          className={cn(
            'text-ink-muted',
            compact ? 'flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]' : 'space-y-0.5 text-[11px]',
          )}
          aria-label="Evidence facts"
        >
          {scan.evidenceFacts.map((fact) => (
            <li key={`${fact.field}-${fact.attribution}`}>
              <span className="font-medium text-ink-faint">{fact.label}</span>
              <span className="mx-1 text-ink-faint">·</span>
              <span>{fact.attribution}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn('text-ink-faint', compact ? 'text-[11px]' : 'text-[11px]')} role="status">
          No field evidence yet
        </p>
      )}

      {scan.conflictHint ? (
        <p
          className={cn('text-warning-foreground', compact ? 'text-[11px]' : 'text-[11px]')}
          role="status"
        >
          {scan.conflictHint}
        </p>
      ) : null}
    </div>
  );
}
