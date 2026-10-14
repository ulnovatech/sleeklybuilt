/**
 * Structured, versionable prospect proof evidence stored on accounts.metadata.prospectProof.
 * Used by website_discover, contact_enrich, purify, and operator why-contact.
 */

import {
  GREENFIELD_FRESHNESS_DAYS_DEFAULT,
  type GreenfieldStatus,
  isGreenfieldStatus,
  parseGreenfieldStatus,
} from './greenfield-status';

export const PROSPECT_PROOF_VERSION = 1 as const;

export type WebsiteHitKind =
  | 'owned_site'
  | 'directory'
  | 'social'
  | 'link_in_bio'
  | 'hosted_storefront'
  | 'article'
  | 'unrelated'
  | 'ambiguous';

export type SearchQueryOutcome =
  | 'completed'
  | 'empty'
  | 'error'
  | 'budget_skip'
  | 'rate_limited'
  | 'unconfigured'
  | 'timeout';

export type WebsiteSearchQueryEvidence = {
  query: string;
  required: boolean;
  role?: 'name_locality' | 'phone_name' | 'website_intent';
  outcome: SearchQueryOutcome;
  engine?: string;
  hitCount?: number;
  errorMessage?: string;
};

export type WebsiteHitEvidence = {
  url: string;
  kind: WebsiteHitKind;
  title?: string;
  confidence: number;
  matchedOn?: string[];
};

export type ContactChannelEvidence = {
  channel: 'phone' | 'email' | 'whatsapp' | 'facebook' | 'instagram' | 'youtube' | 'other_social';
  value: string;
  source: string;
  observedAt: string;
  verified: boolean;
  identityMatch: 'exact' | 'likely' | 'weak' | 'unknown';
};

export type ProspectProof = {
  version: typeof PROSPECT_PROOF_VERSION;
  greenfieldStatus: GreenfieldStatus;
  /** 0–1; only meaningful when searchCompletion === 'complete'. */
  websiteSearchCoverage: number;
  searchCompletion: 'complete' | 'incomplete' | 'failed' | 'skipped' | 'stale';
  websiteSearchAt?: string;
  contactEnrichedAt?: string;
  classificationReason: string;
  conflictReason?: string;
  queries: WebsiteSearchQueryEvidence[];
  websiteHits: WebsiteHitEvidence[];
  contacts: ContactChannelEvidence[];
  ownedWebsiteUrl?: string | null;
};

export function emptyProspectProof(
  status: GreenfieldStatus = 'uncertain',
  reason = 'No website search has been completed',
): ProspectProof {
  return {
    version: PROSPECT_PROOF_VERSION,
    greenfieldStatus: status,
    websiteSearchCoverage: 0,
    searchCompletion: 'incomplete',
    classificationReason: reason,
    queries: [],
    websiteHits: [],
    contacts: [],
  };
}

export function readProspectProof(
  metadata?: Record<string, unknown> | null,
): ProspectProof | undefined {
  const raw = metadata?.prospectProof;
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const status = parseGreenfieldStatus(obj.greenfieldStatus);
  if (!status) return undefined;
  return {
    version: PROSPECT_PROOF_VERSION,
    greenfieldStatus: status,
    websiteSearchCoverage:
      typeof obj.websiteSearchCoverage === 'number' ? obj.websiteSearchCoverage : 0,
    searchCompletion:
      obj.searchCompletion === 'complete' ||
      obj.searchCompletion === 'incomplete' ||
      obj.searchCompletion === 'failed' ||
      obj.searchCompletion === 'skipped' ||
      obj.searchCompletion === 'stale'
        ? obj.searchCompletion
        : 'incomplete',
    websiteSearchAt: typeof obj.websiteSearchAt === 'string' ? obj.websiteSearchAt : undefined,
    contactEnrichedAt:
      typeof obj.contactEnrichedAt === 'string' ? obj.contactEnrichedAt : undefined,
    classificationReason:
      typeof obj.classificationReason === 'string'
        ? obj.classificationReason
        : 'Classification pending',
    conflictReason: typeof obj.conflictReason === 'string' ? obj.conflictReason : undefined,
    queries: Array.isArray(obj.queries) ? (obj.queries as WebsiteSearchQueryEvidence[]) : [],
    websiteHits: Array.isArray(obj.websiteHits) ? (obj.websiteHits as WebsiteHitEvidence[]) : [],
    contacts: Array.isArray(obj.contacts) ? (obj.contacts as ContactChannelEvidence[]) : [],
    ownedWebsiteUrl:
      typeof obj.ownedWebsiteUrl === 'string'
        ? obj.ownedWebsiteUrl
        : obj.ownedWebsiteUrl === null
          ? null
          : undefined,
  };
}

export function mergeProspectProofIntoMetadata(
  metadata: Record<string, unknown> | null | undefined,
  proof: ProspectProof,
): Record<string, unknown> {
  const base = { ...(metadata ?? {}) };
  base.prospectProof = proof;
  base.greenfieldStatus = proof.greenfieldStatus;
  if (proof.ownedWebsiteUrl) {
    base.websiteClass =
      base.websiteClass === 'real' || base.websiteClass === 'broken' || base.websiteClass === 'low_quality'
        ? base.websiteClass
        : 'uncertain';
  }
  return base;
}

export function isProspectProofFresh(
  proof: ProspectProof | undefined,
  now = new Date(),
  maxAgeDays = GREENFIELD_FRESHNESS_DAYS_DEFAULT,
): boolean {
  if (!proof?.websiteSearchAt) return false;
  const ts = Date.parse(proof.websiteSearchAt);
  if (!Number.isFinite(ts)) return false;
  const maxMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return now.getTime() - ts <= maxMs;
}

export function resolveEffectiveGreenfieldStatus(
  metadata?: Record<string, unknown> | null,
  now = new Date(),
): GreenfieldStatus {
  const proof = readProspectProof(metadata);
  if (!proof) {
    const tagged = metadata?.greenfieldStatus;
    if (isGreenfieldStatus(tagged)) {
      if (tagged === 'confirmed_greenfield') return 'uncertain';
      return tagged;
    }
    return 'uncertain';
  }
  if (proof.greenfieldStatus === 'confirmed_greenfield' && !isProspectProofFresh(proof, now)) {
    return 'uncertain';
  }
  if (
    proof.greenfieldStatus === 'confirmed_greenfield' &&
    proof.searchCompletion !== 'complete'
  ) {
    return 'uncertain';
  }
  return proof.greenfieldStatus;
}
