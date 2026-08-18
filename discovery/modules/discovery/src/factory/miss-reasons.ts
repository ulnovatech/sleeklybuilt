import { classifyWebsiteClass, keepOnMorningPath } from '../lib/website-class';

export const FACTORY_MISS_REASONS = [
  'suppressed',
  'snoozed',
  'already_pursued',
  'has_website',
  'no_phone',
  'not_operational',
  'over_cut',
] as const;

export type FactoryMissReason = (typeof FACTORY_MISS_REASONS)[number];

export type PurifyGateInput = {
  phone?: string | null;
  website?: string | null;
  metadata?: Record<string, unknown> | null;
  suppressed: boolean;
  snoozedUntil?: Date | string | null;
  hasActiveLead: boolean;
  analysisHasWebsite: boolean;
};

function isSnoozed(until?: Date | string | null, now = new Date()): boolean {
  if (!until) return false;
  const ts = until instanceof Date ? until.getTime() : new Date(until).getTime();
  return Number.isFinite(ts) && ts > now.getTime();
}

function businessStatus(metadata?: Record<string, unknown> | null): string | undefined {
  const raw = metadata?.businessStatus;
  return typeof raw === 'string' ? raw : undefined;
}

function hasOwnedWebsite(input: PurifyGateInput): boolean {
  if (!keepOnMorningPath({ website: input.website, metadata: input.metadata })) return true;
  if (!input.analysisHasWebsite) return false;
  return classifyWebsiteClass(input.website) !== 'link_in_bio';
}

/** First blocking miss reason, or null if the row may enter the morning ranking pool. */
export function classifyMissReason(input: PurifyGateInput, now = new Date()): FactoryMissReason | null {
  if (input.suppressed) return 'suppressed';
  if (isSnoozed(input.snoozedUntil, now)) return 'snoozed';
  if (input.hasActiveLead) return 'already_pursued';
  if (hasOwnedWebsite(input)) return 'has_website';
  if (!input.phone?.trim()) return 'no_phone';
  const status = businessStatus(input.metadata);
  if (status && status.toUpperCase() !== 'OPERATIONAL') return 'not_operational';
  return null;
}
