/**
 * Deterministic website-search completion contract.
 *
 * Rationale (initial Plan B / Brave contract):
 * - Required: name + locality (city and/or country) query — identity anchor.
 * - Conditional: phone + name when phone present.
 * - Conditional: website-intent query when locality known.
 * - Name-only plans can never reach confirmed_greenfield (identity too weak).
 * - Coverage = weighted completed queries / planned (required=1, conditional=0.5).
 * - Complete when all required succeed AND weighted coverage ≥ 0.67 AND locality present.
 * - Empty results are negative evidence only when complete.
 * - Budget skip / error / timeout / unconfigured → incomplete (never confirmed).
 */

import type { SearchQueryOutcome, WebsiteSearchQueryEvidence } from './prospect-evidence';

export type WebsiteSearchPlanInput = {
  name: string;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
};

export type PlannedWebsiteQuery = {
  query: string;
  required: boolean;
  role: 'name_locality' | 'phone_name' | 'website_intent';
};

const REQUIRED_WEIGHT = 1;
const CONDITIONAL_WEIGHT = 0.5;
export const MIN_WEIGHTED_COVERAGE = 0.67;

export function buildWebsiteSearchPlan(input: WebsiteSearchPlanInput): PlannedWebsiteQuery[] {
  const name = input.name.trim();
  const city = input.city?.trim();
  const country = input.country?.trim();
  const phone = input.phone?.trim();
  const locality = [city, country].filter(Boolean).join(', ');
  const plan: PlannedWebsiteQuery[] = [];

  if (name && city) {
    plan.push({
      query: `"${name}" "${city}"`,
      required: true,
      role: 'name_locality',
    });
  } else if (name && country) {
    plan.push({
      query: `"${name}" "${country}"`,
      required: true,
      role: 'name_locality',
    });
  } else if (name) {
    plan.push({
      query: `"${name}" website`,
      required: true,
      role: 'name_locality',
    });
  }

  if (name && phone) {
    plan.push({
      query: `"${name}" ${phone}`,
      required: false,
      role: 'phone_name',
    });
  }

  if (name && locality) {
    plan.push({
      query: `"${name}" ${locality} website OR official site`,
      required: false,
      role: 'website_intent',
    });
  }

  return plan;
}

export function planHasSufficientIdentity(plan: PlannedWebsiteQuery[]): boolean {
  const nameLocality = plan.find((q) => q.role === 'name_locality');
  if (!nameLocality) return false;
  // Name-only: query is `"Name" website` — insufficient for confirmation.
  const quoted = nameLocality.query.match(/"([^"]+)"/g) ?? [];
  return quoted.length >= 2;
}

export function isSuccessfulQueryOutcome(outcome: SearchQueryOutcome): boolean {
  return outcome === 'completed' || outcome === 'empty';
}

export function computeWebsiteSearchCoverage(queries: WebsiteSearchQueryEvidence[]): {
  coverage: number;
  requiredComplete: boolean;
  complete: boolean;
  reason: string;
} {
  if (queries.length === 0) {
    return {
      coverage: 0,
      requiredComplete: false,
      complete: false,
      reason: 'No website search queries were planned or executed',
    };
  }

  const asPlan: PlannedWebsiteQuery[] = queries.map((q) => ({
    query: q.query,
    required: q.required,
    role: q.role ?? (q.required ? 'name_locality' : 'website_intent'),
  }));

  if (!planHasSufficientIdentity(asPlan)) {
    return {
      coverage: 0,
      requiredComplete: false,
      complete: false,
      reason: 'Insufficient identity locality for confirmed greenfield (name-only search)',
    };
  }

  const required = queries.filter((q) => q.required);
  const requiredOk = required.every((q) => isSuccessfulQueryOutcome(q.outcome));
  if (!requiredOk) {
    const failed = required.find((q) => !isSuccessfulQueryOutcome(q.outcome));
    return {
      coverage: 0,
      requiredComplete: false,
      complete: false,
      reason: failed
        ? `Required query incomplete (${failed.outcome}): ${failed.query}`
        : 'Required website search queries incomplete',
    };
  }

  let earned = 0;
  let possible = 0;
  for (const q of queries) {
    const w = q.required ? REQUIRED_WEIGHT : CONDITIONAL_WEIGHT;
    possible += w;
    if (isSuccessfulQueryOutcome(q.outcome)) earned += w;
  }
  const coverage = possible > 0 ? earned / possible : 0;
  const complete = requiredOk && coverage + 1e-9 >= MIN_WEIGHTED_COVERAGE;

  return {
    coverage,
    requiredComplete: requiredOk,
    complete,
    reason: complete
      ? 'Required queries completed with adequate weighted coverage'
      : `Coverage ${coverage.toFixed(2)} below ${MIN_WEIGHTED_COVERAGE}`,
  };
}

export function emptyResultsAreNegativeEvidence(queries: WebsiteSearchQueryEvidence[]): boolean {
  return computeWebsiteSearchCoverage(queries).complete;
}
