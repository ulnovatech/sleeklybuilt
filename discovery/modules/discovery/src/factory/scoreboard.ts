import { classifyMissReason, type FactoryMissReason } from './miss-reasons';

const UNPITCHED_STATUSES = new Set(['NEW', 'REVIEWED']);
const PITCHED_BLOCK_STATUSES = new Set([
  'CONTACTED',
  'REPLIED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'CLOSED_WON',
  'CLOSED_LOST',
  'NO_RESPONSE',
  'NOT_INTERESTED',
  'ARCHIVED',
]);

export type FactoryYieldRow = {
  city: string;
  industry: string;
  country: string;
  yieldScore: number;
  qualified: number | null;
  newAccounts: number | null;
  won: number;
  lost: number;
  emptyStreak: number;
  headline: string;
};

export type DemandJumpBlock =
  | 'cohort_not_frozen'
  | 'no_phone'
  | 'no_contact_channel'
  | 'has_website'
  | 'uncertain_website'
  | 'search_incomplete'
  | 'suppressed'
  | 'snoozed'
  | 'not_operational'
  | 'already_pitched'
  | 'already_pursued';

export function isUnpitchedLeadStatus(status?: string | null): boolean {
  if (!status) return true;
  return UNPITCHED_STATUSES.has(status);
}

export function isPitchedLeadStatus(status?: string | null): boolean {
  if (!status) return false;
  return !UNPITCHED_STATUSES.has(status);
}

export function countPitchedKeepers(statuses: Array<string | null | undefined>): {
  pitched: number;
  unpitched: number;
} {
  let pitched = 0;
  let unpitched = 0;
  for (const status of statuses) {
    if (isPitchedLeadStatus(status)) pitched += 1;
    else unpitched += 1;
  }
  return { pitched, unpitched };
}

export function greenfieldIntegrity(keepers: number, modernizeCount: number): {
  modernizeCount: number;
  greenfieldPct: number | null;
} {
  if (keepers <= 0) return { modernizeCount, greenfieldPct: null };
  const clean = Math.max(0, keepers - modernizeCount);
  return {
    modernizeCount,
    greenfieldPct: Math.round((clean / keepers) * 1000) / 10,
  };
}

export function yieldHeadline(input: {
  city: string;
  industry: string;
  yieldScore: number;
  won: number;
  lost: number;
  emptyStreak: number;
}): string {
  const segment = `${input.city} ${input.industry}`.trim();
  if (input.emptyStreak >= 3) return `${segment} is cooling off — rotation will skip it for a week`;
  if (input.won > input.lost && input.won + input.lost >= 1) {
    return `${segment} works — ${input.won} won vs ${input.lost} lost`;
  }
  if (input.yieldScore > 0) return `${segment} is producing keepers`;
  if (input.yieldScore < 0) return `${segment} is underperforming`;
  return `${segment} has no yield yet`;
}

export function demandJumpBlockReason(input: {
  cohortStatus?: string | null;
  phone?: string | null;
  email?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  website?: string | null;
  metadata?: Record<string, unknown> | null;
  suppressed: boolean;
  snoozedUntil?: Date | string | null;
  analysisHasWebsite: boolean;
  leadStatus?: string | null;
}): DemandJumpBlock | null {
  if (input.cohortStatus !== 'frozen') return 'cohort_not_frozen';
  if (input.leadStatus && PITCHED_BLOCK_STATUSES.has(input.leadStatus)) return 'already_pitched';
  const miss = classifyMissReason({
    phone: input.phone,
    email: input.email,
    facebookUrl: input.facebookUrl,
    instagramUrl: input.instagramUrl,
    youtubeUrl: input.youtubeUrl,
    website: input.website,
    metadata: input.metadata,
    suppressed: input.suppressed,
    snoozedUntil: input.snoozedUntil,
    hasActiveLead: false,
    analysisHasWebsite: input.analysisHasWebsite,
  });
  if (
    miss === 'suppressed' ||
    miss === 'snoozed' ||
    miss === 'has_website' ||
    miss === 'no_phone' ||
    miss === 'no_contact_channel' ||
    miss === 'uncertain_website' ||
    miss === 'search_incomplete' ||
    miss === 'not_operational' ||
    miss === 'already_pursued'
  ) {
    return miss;
  }
  return null;
}

export function dumpsterReasonCoverage(dumpsterCount: number, missingReason: number): number | null {
  if (dumpsterCount <= 0) return null;
  return Math.round(((dumpsterCount - missingReason) / dumpsterCount) * 1000) / 10;
}

export type { FactoryMissReason };
