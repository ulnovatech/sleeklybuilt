export type PresenceClass =
  | 'greenfield'
  | 'social_only'
  | 'link_in_bio'
  | 'redesign'
  | 'unknown';

export type SegmentKeyParts = {
  industry?: string | null;
  city?: string | null;
  presenceClass?: PresenceClass | string | null;
  primaryGap?: string | null;
};

export const SEGMENT_MIN_SAMPLE = 5;
export const SEGMENT_ADJUSTMENT_MIN = -8;
export const SEGMENT_ADJUSTMENT_MAX = 8;
/** Fallback baseline win rate when global sample is too small. */
export const SEGMENT_BASELINE_FALLBACK = 0.5;

export function normalizeSegmentPart(value: string | null | undefined, fallback = 'unknown'): string {
  const trimmed = (value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
  return trimmed || fallback;
}

/** Stable key: industry|city|presenceClass|primaryGap */
export function segmentKeyFor(parts: SegmentKeyParts): string {
  return [
    normalizeSegmentPart(parts.industry, 'unknown'),
    normalizeSegmentPart(parts.city, 'unknown'),
    normalizeSegmentPart(parts.presenceClass, 'unknown'),
    normalizeSegmentPart(parts.primaryGap, 'none'),
  ].join('|');
}

export function parseSegmentKey(key: string): {
  industry: string;
  city: string;
  presenceClass: string;
  primaryGap: string;
} {
  const [industry = 'unknown', city = 'unknown', presenceClass = 'unknown', primaryGap = 'none'] =
    key.split('|');
  return { industry, city, presenceClass, primaryGap };
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Bounded scoring factor from segment win rate vs baseline.
 * Only meaningful when sampleSize ≥ SEGMENT_MIN_SAMPLE (caller enforces).
 */
export function computeSegmentAdjustment(
  winRate: number,
  baseline: number = SEGMENT_BASELINE_FALLBACK,
): number {
  const safeWin = Number.isFinite(winRate) ? winRate : 0;
  const safeBase = Number.isFinite(baseline) ? baseline : SEGMENT_BASELINE_FALLBACK;
  return clamp(
    Math.round((safeWin - safeBase) * 20),
    SEGMENT_ADJUSTMENT_MIN,
    SEGMENT_ADJUSTMENT_MAX,
  );
}

export function formatSegmentRecordLabel(input: {
  won: number;
  lost: number;
  industry?: string | null;
  city?: string | null;
  presenceClass?: string | null;
}): string {
  const industry = humanize(input.industry) || 'Unknown industry';
  const city = humanize(input.city) || 'Unknown city';
  const presence = humanize(input.presenceClass) || 'unknown presence';
  return `Segment record: ${input.won} won / ${input.lost} lost (${industry} · ${city} · ${presence})`;
}

function humanize(value: string | null | undefined): string {
  if (!value?.trim()) return '';
  return value
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function derivePresenceClassFromBiHints(hints?: {
  socialOnlyPresence?: boolean;
  linktreeOnly?: boolean;
  hasWebsite?: boolean;
} | null): PresenceClass {
  if (!hints) return 'unknown';
  if (hints.linktreeOnly) return 'link_in_bio';
  if (hints.socialOnlyPresence) return 'social_only';
  if (hints.hasWebsite === false) return 'greenfield';
  if (hints.hasWebsite === true) return 'redesign';
  return 'unknown';
}

/** Prefer highest-severity digital gap id; else map BI hint flags. */
export function derivePrimaryGap(input: {
  digitalGapIds?: string[];
  biHints?: {
    linktreeOnly?: boolean;
    socialOnlyPresence?: boolean;
    missingOnlineBooking?: boolean;
    missingEmailCapture?: boolean;
    missingAnalytics?: boolean;
    needsLeadGen?: boolean;
  } | null;
}): string {
  const fromGaps = input.digitalGapIds?.find((id) => !!id?.trim());
  if (fromGaps) return normalizeSegmentPart(fromGaps, 'none');
  const h = input.biHints;
  if (!h) return 'none';
  if (h.socialOnlyPresence) return 'social_only';
  if (h.linktreeOnly) return 'link_in_bio';
  if (h.missingOnlineBooking) return 'no_booking';
  if (h.needsLeadGen) return 'needs_lead_gen';
  if (h.missingEmailCapture) return 'no_email_capture';
  if (h.missingAnalytics) return 'no_analytics';
  return 'none';
}
