/**
 * Authoritative greenfield campaign classification (reliability pipeline).
 * Distinct from WebsiteClass (quality of a known URL).
 *
 * confirmed_greenfield — adequate website search completed; no owned site found.
 * existing_website — credible owned-site evidence (exclude from no-website Pitch Today).
 * uncertain — incomplete, stale, ambiguous, conflicting, or failed search.
 *
 * Missing data is never negative evidence.
 */

export type GreenfieldStatus = 'confirmed_greenfield' | 'uncertain' | 'existing_website';

export const GREENFIELD_STATUSES: readonly GreenfieldStatus[] = [
  'confirmed_greenfield',
  'uncertain',
  'existing_website',
] as const;

/** Default freshness window before a confirmed status must be re-probed (days). */
export const GREENFIELD_FRESHNESS_DAYS_DEFAULT = 14;

export function isGreenfieldStatus(value: unknown): value is GreenfieldStatus {
  return (
    value === 'confirmed_greenfield' ||
    value === 'uncertain' ||
    value === 'existing_website'
  );
}

export function parseGreenfieldStatus(value: unknown): GreenfieldStatus | undefined {
  return isGreenfieldStatus(value) ? value : undefined;
}

export function greenfieldStatusLabel(status: GreenfieldStatus): string {
  switch (status) {
    case 'confirmed_greenfield':
      return 'Confirmed greenfield';
    case 'existing_website':
      return 'Existing website';
    case 'uncertain':
      return 'Uncertain — investigate';
  }
}

/** Pitch Today / morning path: only confirmed greenfield after adequate search. */
export function isConfirmedGreenfieldForPitch(status: GreenfieldStatus | undefined | null): boolean {
  return status === 'confirmed_greenfield';
}

export function readGreenfieldStatusFromMetadata(
  metadata?: Record<string, unknown> | null,
): GreenfieldStatus | undefined {
  return parseGreenfieldStatus(metadata?.greenfieldStatus);
}
