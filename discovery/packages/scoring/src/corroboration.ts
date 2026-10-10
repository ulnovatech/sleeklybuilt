/**
 * Multi-source corroboration bonus (Plan B Chunk 08).
 * Slight ranking lift when identity/contact facts appear from 2+ discovery sources.
 */

/** Identity / contact fields that count toward corroboration (not bare name). */
export const CORROBORATION_EVIDENCE_FIELDS = [
  'phone',
  'website',
  'email',
  'sourceUrl',
  'facebookUrl',
  'instagramUrl',
  'youtubeUrl',
  'tiktokUrl',
  'linkedinUrl',
  'twitterUrl',
  'googleMapsUrl',
] as const;

export const CORROBORATION_BONUS_TWO = 3;
export const CORROBORATION_BONUS_THREE_PLUS = 5;
export const CORROBORATION_BONUS_CAP = 5;

export function countDistinctSources(
  sources: Array<string | null | undefined>,
): number {
  const set = new Set<string>();
  for (const s of sources) {
    const t = s?.trim();
    if (t) set.add(t);
  }
  return set.size;
}

/** Capped bonus: +3 at 2 sources, +5 at 3+. */
export function corroborationBonus(sourceCount: number): number {
  if (sourceCount >= 3) return CORROBORATION_BONUS_THREE_PLUS;
  if (sourceCount >= 2) return CORROBORATION_BONUS_TWO;
  return 0;
}

export type CorroborationEvidenceField = {
  field?: string;
  source?: string;
};

/**
 * Count distinct discovery sources that attributed allowlisted identity/contact fields.
 * Bare `name` and fieldless entries do not count. `primarySource` alone does not count
 * (avoids +3 when OSM only contributed a name and another source contributed phone).
 */
export function countCorroboratingSources(input: {
  primarySource?: string | null;
  evidenceFields?: CorroborationEvidenceField[] | null;
}): number {
  void input.primarySource; // reserved for callers; contact proof comes from evidence fields
  const sources: string[] = [];
  const allow = new Set<string>(CORROBORATION_EVIDENCE_FIELDS);
  for (const entry of input.evidenceFields ?? []) {
    if (!entry?.source?.trim()) continue;
    if (!entry.field || !allow.has(entry.field)) continue;
    sources.push(entry.source.trim());
  }
  return countDistinctSources(sources);
}
