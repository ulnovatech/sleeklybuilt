import { evaluatePitchTodayEligibility } from '../lib/pitch-today-eligibility';
import { resolveEffectiveGreenfieldStatus } from '../lib/prospect-evidence';
import { keepOnMorningPath, resolveWebsiteClass } from '../lib/website-class';

export const FACTORY_MISS_REASONS = [
  'suppressed',
  'snoozed',
  'already_pursued',
  'has_website',
  'uncertain_website',
  'search_incomplete',
  'no_phone',
  'no_contact_channel',
  'not_operational',
  'over_cut',
] as const;

export type FactoryMissReason = (typeof FACTORY_MISS_REASONS)[number];

export type PurifyGateInput = {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
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

/** Crawl-proven healthy owned site OR analysis/BI evidence of owned website. */
function hasOwnedWebsite(input: PurifyGateInput): boolean {
  if (input.analysisHasWebsite) return true;
  if (!keepOnMorningPath({ website: input.website, metadata: input.metadata })) return true;
  return resolveEffectiveGreenfieldStatus(input.metadata) === 'existing_website';
}

/** First blocking miss reason, or null if the row may enter the morning ranking pool. */
export function classifyMissReason(input: PurifyGateInput, now = new Date()): FactoryMissReason | null {
  if (input.suppressed) return 'suppressed';
  if (isSnoozed(input.snoozedUntil, now)) return 'snoozed';
  if (input.hasActiveLead) return 'already_pursued';

  if (hasOwnedWebsite(input)) return 'has_website';

  const cls = resolveWebsiteClass({ website: input.website, metadata: input.metadata });
  if (cls === 'real') return 'has_website';

  const gf = resolveEffectiveGreenfieldStatus(input.metadata, now);
  if (gf === 'existing_website') return 'has_website';
  if (gf !== 'confirmed_greenfield') {
    const completion = (input.metadata?.prospectProof as { searchCompletion?: string } | undefined)
      ?.searchCompletion;
    if (
      completion === 'failed' ||
      completion === 'skipped' ||
      completion === 'incomplete' ||
      !input.metadata?.prospectProof
    ) {
      return 'search_incomplete';
    }
    return 'uncertain_website';
  }

  const pitch = evaluatePitchTodayEligibility(
    {
      phone: input.phone,
      email: input.email,
      facebookUrl: input.facebookUrl,
      instagramUrl: input.instagramUrl,
      youtubeUrl: input.youtubeUrl,
      metadata: input.metadata,
    },
    now,
  );
  if (!pitch.hasPhone) return 'no_phone';
  if (!pitch.hasAdditionalChannel) return 'no_contact_channel';
  if (!pitch.eligible) {
    if (pitch.greenfieldStatus === 'existing_website') return 'has_website';
    return 'uncertain_website';
  }

  const status = businessStatus(input.metadata);
  if (status && status.toUpperCase() !== 'OPERATIONAL') return 'not_operational';
  return null;
}
