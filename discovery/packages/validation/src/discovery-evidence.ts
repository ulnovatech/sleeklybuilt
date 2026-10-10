/**
 * Field-level discovery provenance (Plan B Chunk 06).
 * Stored under metadata.discoveryEvidence — no new DB tables.
 */

export type DiscoveryEvidenceSource =
  | 'google_maps'
  | 'openstreetmap'
  | 'public_search'
  | 'social_search'
  | 'facebook'
  | 'instagram'
  | 'csv_import'
  | 'manual'
  | 'demand_inbox';

export type DiscoveryEvidenceField =
  | 'phone'
  | 'website'
  | 'email'
  | 'name'
  | 'sourceUrl'
  | 'googleMapsUrl'
  | 'facebookUrl'
  | 'instagramUrl'
  | 'youtubeUrl'
  | 'tiktokUrl'
  | 'linkedinUrl'
  | 'twitterUrl';

export type DiscoveryEvidenceConfidence = 'high' | 'medium' | 'low';

export type DiscoveryEvidenceEntry = {
  field: DiscoveryEvidenceField;
  value: string;
  source: DiscoveryEvidenceSource;
  sourceUrl?: string;
  externalId?: string;
  /** How the value was obtained, e.g. osm_tags.phone, snippet_regex */
  method?: string;
  /** Provider backend detail, e.g. geofabrik_pbf, pages_search */
  backend?: string;
  capturedAt: string;
  confidence: DiscoveryEvidenceConfidence;
};

export type DiscoveryEvidenceConflict = {
  field: DiscoveryEvidenceField;
  values: Array<{
    value: string;
    source: DiscoveryEvidenceSource;
    sourceUrl?: string;
    confidence?: DiscoveryEvidenceConfidence;
  }>;
};

export type DiscoveryEvidence = {
  /** Append-only attribution history (deduped on merge). */
  fields: DiscoveryEvidenceEntry[];
  /** Pointer to entry matching the current winning phone scalar. */
  phone?: DiscoveryEvidenceEntry;
  /** Pointer to entry matching the current winning website scalar. */
  website?: DiscoveryEvidenceEntry;
  /** Distinct conflicting values per field (no silent overwrite). */
  conflicts?: DiscoveryEvidenceConflict[];
};

const CONTACT_FIELDS: DiscoveryEvidenceField[] = ['phone', 'website', 'email'];

export function isDiscoveryEvidence(value: unknown): value is DiscoveryEvidence {
  if (!value || typeof value !== 'object') return false;
  const v = value as DiscoveryEvidence;
  return Array.isArray(v.fields);
}

export function readDiscoveryEvidence(
  metadata: Record<string, unknown> | null | undefined,
): DiscoveryEvidence | undefined {
  if (!metadata) return undefined;
  const raw = metadata.discoveryEvidence;
  return isDiscoveryEvidence(raw) ? raw : undefined;
}

function normalizeValue(field: DiscoveryEvidenceField, value: string): string {
  const trimmed = value.trim();
  if (field === 'phone') return trimmed.replace(/[^\d+]/g, '');
  if (field === 'website' || field === 'googleMapsUrl' || field === 'facebookUrl' || field === 'instagramUrl') {
    return trimmed.replace(/\/+$/, '').toLowerCase();
  }
  return trimmed.toLowerCase();
}

function entryKey(entry: DiscoveryEvidenceEntry): string {
  return [
    entry.field,
    entry.source,
    normalizeValue(entry.field, entry.value),
    entry.externalId ?? '',
    entry.method ?? '',
  ].join('|');
}

export function makeEvidenceEntry(input: {
  field: DiscoveryEvidenceField;
  value: string;
  source: DiscoveryEvidenceSource;
  sourceUrl?: string;
  externalId?: string;
  method?: string;
  backend?: string;
  confidence?: DiscoveryEvidenceConfidence;
  capturedAt?: string;
}): DiscoveryEvidenceEntry | null {
  const value = input.value?.trim();
  if (!value) return null;
  return {
    field: input.field,
    value,
    source: input.source,
    sourceUrl: input.sourceUrl,
    externalId: input.externalId,
    method: input.method,
    backend: input.backend,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    confidence: input.confidence ?? 'medium',
  };
}

export type FieldEvidenceSpec = {
  method?: string;
  backend?: string;
  confidence?: DiscoveryEvidenceConfidence;
};

/**
 * Attach discoveryEvidence for present contact/profile fields on a discovered business-like object.
 */
export function attachDiscoveryEvidence<
  T extends {
    source: DiscoveryEvidenceSource;
    sourceUrl?: string;
    externalId?: string;
    phone?: string;
    website?: string;
    email?: string;
    googleMapsUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    name?: string;
    metadata?: Record<string, unknown>;
  },
>(
  business: T,
  specs: Partial<Record<DiscoveryEvidenceField, FieldEvidenceSpec>> = {},
): T {
  const entries: DiscoveryEvidenceEntry[] = [];
  const push = (field: DiscoveryEvidenceField, value: string | undefined) => {
    const spec = specs[field] ?? {};
    const entry = makeEvidenceEntry({
      field,
      value: value ?? '',
      source: business.source,
      sourceUrl: business.sourceUrl,
      externalId: business.externalId,
      method: spec.method,
      backend: spec.backend,
      confidence: spec.confidence,
    });
    if (entry) entries.push(entry);
  };

  const meta = business.metadata ?? {};
  const metaStr = (key: string) =>
    typeof meta[key] === 'string' ? (meta[key] as string) : undefined;

  push('phone', business.phone);
  push('website', business.website);
  push('email', business.email);
  push('sourceUrl', business.sourceUrl);
  push('googleMapsUrl', business.googleMapsUrl);
  push('facebookUrl', business.facebookUrl);
  push('instagramUrl', business.instagramUrl);
  push('youtubeUrl', metaStr('youtubeUrl'));
  push('tiktokUrl', metaStr('tiktokUrl'));
  push('linkedinUrl', metaStr('linkedinUrl'));
  push('twitterUrl', metaStr('twitterUrl'));

  if (entries.length === 0) return business;

  const evidence = finalizeEvidence(entries, {
    phone: business.phone,
    website: business.website,
  });

  return {
    ...business,
    metadata: {
      ...(business.metadata ?? {}),
      discoveryEvidence: evidence,
    },
  };
}

export function finalizeEvidence(
  fields: DiscoveryEvidenceEntry[],
  winners: { phone?: string; website?: string; email?: string } = {},
): DiscoveryEvidence {
  const deduped = dedupeEntries(fields);
  const conflicts = buildConflicts(deduped);
  return {
    fields: deduped,
    phone: pickWinner(deduped, 'phone', winners.phone),
    website: pickWinner(deduped, 'website', winners.website),
    ...(conflicts.length ? { conflicts } : {}),
  };
}

function dedupeEntries(fields: DiscoveryEvidenceEntry[]): DiscoveryEvidenceEntry[] {
  const seen = new Set<string>();
  const out: DiscoveryEvidenceEntry[] = [];
  for (const entry of fields) {
    const key = entryKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function pickWinner(
  fields: DiscoveryEvidenceEntry[],
  field: DiscoveryEvidenceField,
  winnerValue?: string,
): DiscoveryEvidenceEntry | undefined {
  const candidates = fields.filter((f) => f.field === field);
  if (!candidates.length) return undefined;
  if (winnerValue?.trim()) {
    const norm = normalizeValue(field, winnerValue);
    const match = candidates.find((c) => normalizeValue(field, c.value) === norm);
    if (match) return match;
  }
  const rank = { high: 3, medium: 2, low: 1 };
  return [...candidates].sort((a, b) => {
    const conf = rank[b.confidence] - rank[a.confidence];
    if (conf !== 0) return conf;
    return (b.capturedAt || '').localeCompare(a.capturedAt || '');
  })[0];
}

function buildConflicts(fields: DiscoveryEvidenceEntry[]): DiscoveryEvidenceConflict[] {
  const conflicts: DiscoveryEvidenceConflict[] = [];
  for (const field of CONTACT_FIELDS) {
    const entries = fields.filter((f) => f.field === field);
    const byValue = new Map<string, DiscoveryEvidenceEntry>();
    for (const e of entries) {
      const key = normalizeValue(field, e.value);
      if (!byValue.has(key)) byValue.set(key, e);
    }
    if (byValue.size <= 1) continue;
    conflicts.push({
      field,
      values: [...byValue.values()].map((e) => ({
        value: e.value,
        source: e.source,
        sourceUrl: e.sourceUrl,
        confidence: e.confidence,
      })),
    });
  }
  return conflicts;
}

/**
 * Merge two discoveryEvidence bags. Appends history; recomputes winners from current scalars.
 */
export function mergeDiscoveryEvidence(
  existing: DiscoveryEvidence | undefined,
  incoming: DiscoveryEvidence | undefined,
  winners: { phone?: string | null; website?: string | null; email?: string | null } = {},
): DiscoveryEvidence | undefined {
  if (!existing && !incoming) return undefined;
  return finalizeEvidence(
    [...(existing?.fields ?? []), ...(incoming?.fields ?? [])],
    {
      phone: winners.phone ?? undefined,
      website: winners.website ?? undefined,
      email: winners.email ?? undefined,
    },
  );
}

const CRAWL_PROVEN_WEBSITE_CLASS = new Set(['real', 'broken', 'low_quality']);

/**
 * Preserve crawl-proven websiteClass over ingest `uncertain` on rediscovery.
 * (Mirrors discovery mergeWebsiteClass — kept here so accounts can merge without importing discovery.)
 */
export function mergeWebsiteClassField(existing: unknown, incoming: unknown): string | undefined {
  const prev = typeof existing === 'string' ? existing : undefined;
  const next = typeof incoming === 'string' ? incoming : undefined;
  if (!next) return prev;
  if (!prev) return next;
  if (next === 'uncertain' && CRAWL_PROVEN_WEBSITE_CLASS.has(prev)) return prev;
  if (prev === 'uncertain' && CRAWL_PROVEN_WEBSITE_CLASS.has(next)) return next;
  if (CRAWL_PROVEN_WEBSITE_CLASS.has(next)) return next;
  if (CRAWL_PROVEN_WEBSITE_CLASS.has(prev)) return prev;
  return next;
}

/**
 * Shallow-merge metadata bags and deep-merge discoveryEvidence.
 * Fixes prior behavior that replaced the whole bag on non-Places updates.
 * Protects crawl-proven websiteClass from ingest uncertain overwrite.
 */
export function mergeAccountMetadata(
  existing: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown> | null | undefined,
  winners: { phone?: string | null; website?: string | null; email?: string | null } = {},
): Record<string, unknown> | null {
  if (!existing && !incoming) return null;
  const base = { ...(existing ?? {}) };
  const next = { ...(incoming ?? {}) };
  const existingEv = readDiscoveryEvidence(base);
  const incomingEv = readDiscoveryEvidence(next);
  const existingClass = base.websiteClass;
  const incomingClass = next.websiteClass;
  delete base.discoveryEvidence;
  delete next.discoveryEvidence;
  const mergedEv = mergeDiscoveryEvidence(existingEv, incomingEv, winners);
  const out: Record<string, unknown> = { ...base, ...next };
  if (mergedEv) out.discoveryEvidence = mergedEv;
  const mergedClass = mergeWebsiteClassField(existingClass, incomingClass);
  if (mergedClass !== undefined) out.websiteClass = mergedClass;
  else delete out.websiteClass;
  return out;
}

const SOURCE_LABELS: Record<string, string> = {
  google_maps: 'Google Maps',
  openstreetmap: 'OpenStreetMap',
  public_search: 'Public search',
  social_search: 'Social search',
  facebook: 'Facebook',
  instagram: 'Instagram',
  csv_import: 'CSV',
  manual: 'Manual',
  demand_inbox: 'Demand inbox',
};

const BACKEND_LABELS: Record<string, string> = {
  geofabrik_pbf: 'Geofabrik',
  overpass: 'Overpass',
  pages_search: 'Pages search',
  places_text_search: 'Places',
  snippet_regex: 'snippet',
};

/** Operator-facing one-liner, e.g. "OpenStreetMap · Geofabrik · high". */
export function formatEvidenceAttribution(entry: DiscoveryEvidenceEntry | undefined): string | null {
  if (!entry) return null;
  const source = SOURCE_LABELS[entry.source] ?? entry.source;
  const backend = entry.backend ? BACKEND_LABELS[entry.backend] ?? entry.backend : null;
  const parts = [source];
  if (backend) parts.push(backend);
  parts.push(entry.confidence);
  return parts.join(' · ');
}

export function formatEvidenceConflicts(conflicts: DiscoveryEvidenceConflict[] | undefined): string | null {
  if (!conflicts?.length) return null;
  return conflicts
    .map((c) => {
      const vals = c.values
        .map((v) => `${SOURCE_LABELS[v.source] ?? v.source}: ${v.value}`)
        .join(' vs ');
      return `${c.field} conflict — ${vals}`;
    })
    .join('; ');
}
