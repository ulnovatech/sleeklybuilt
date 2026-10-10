/**
 * Operator "why contact" scan helpers (Plan B Chunk 09).
 * Deterministic copy from websiteClass + contact + discoveryEvidence — no JSON required.
 */

import { derivePitchAngle } from '@agency/scoring';
import {
  formatEvidenceAttribution,
  readDiscoveryEvidence,
  type DiscoveryEvidence,
  type DiscoveryEvidenceEntry,
  type DiscoveryEvidenceField,
} from '@agency/validation';
import {
  parseWebsiteClass,
  resolveWebsiteClass,
  websiteClassLabel,
  type WebsiteClass,
} from './website-class';

export type Contactability = 'phone' | 'email' | 'both' | 'none';

export type EvidenceFact = {
  field: string;
  label: string;
  attribution: string;
};

export type WhyContactScan = {
  websiteClass: WebsiteClass;
  websiteClassLabel: string;
  contactability: Contactability;
  contactabilityLabel: string;
  whyContact: string;
  evidenceFacts: EvidenceFact[];
  conflictHint: string | null;
  thinEvidence: boolean;
};

const FACT_PRIORITY: DiscoveryEvidenceField[] = [
  'phone',
  'website',
  'email',
  'sourceUrl',
  'facebookUrl',
  'instagramUrl',
  'youtubeUrl',
  'googleMapsUrl',
];

const FIELD_LABELS: Record<string, string> = {
  phone: 'Phone',
  website: 'Website',
  email: 'Email',
  sourceUrl: 'Source URL',
  facebookUrl: 'Facebook',
  instagramUrl: 'Instagram',
  youtubeUrl: 'YouTube',
  googleMapsUrl: 'Maps',
};

export function contactabilityOf(input: {
  phone?: string | null;
  email?: string | null;
}): Contactability {
  const phone = !!input.phone?.trim();
  const email = !!input.email?.trim();
  if (phone && email) return 'both';
  if (phone) return 'phone';
  if (email) return 'email';
  return 'none';
}

export function contactabilityLabel(c: Contactability): string {
  switch (c) {
    case 'both':
      return 'Phone + email';
    case 'phone':
      return 'Phone ready';
    case 'email':
      return 'Email ready';
    case 'none':
      return 'No contact path';
  }
}

export function websiteClassTone(
  cls: WebsiteClass,
): 'success' | 'warning' | 'neutral' | 'danger' | 'info' {
  switch (cls) {
    case 'none':
    case 'link_in_bio':
      return 'success';
    case 'broken':
    case 'low_quality':
      return 'warning';
    case 'uncertain':
      return 'info';
    case 'real':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function contactabilityTone(
  c: Contactability,
): 'success' | 'warning' | 'neutral' | 'danger' | 'info' {
  if (c === 'none') return 'danger';
  if (c === 'both') return 'success';
  return 'success';
}

function pickEvidenceEntry(
  evidence: DiscoveryEvidence | undefined,
  field: DiscoveryEvidenceField,
): DiscoveryEvidenceEntry | undefined {
  if (!evidence) return undefined;
  if (field === 'phone' && evidence.phone) return evidence.phone;
  if (field === 'website' && evidence.website) return evidence.website;
  return evidence.fields.find((f) => f.field === field);
}

/** Top N evidence facts for operator scan (default 2). */
export function topEvidenceFacts(
  evidence: DiscoveryEvidence | undefined,
  limit = 2,
): EvidenceFact[] {
  const facts: EvidenceFact[] = [];
  const seen = new Set<string>();
  for (const field of FACT_PRIORITY) {
    if (facts.length >= limit) break;
    const entry = pickEvidenceEntry(evidence, field);
    if (!entry) continue;
    const key = `${entry.field}:${entry.source}:${entry.value}`;
    if (seen.has(key)) continue;
    const attribution = formatEvidenceAttribution(entry);
    if (!attribution) continue;
    seen.add(key);
    facts.push({
      field: entry.field,
      label: FIELD_LABELS[entry.field] ?? entry.field,
      attribution,
    });
  }
  return facts;
}

function distinctContactSources(evidence: DiscoveryEvidence | undefined): string[] {
  if (!evidence?.fields?.length) return [];
  const allow = new Set(FACT_PRIORITY);
  const set = new Set<string>();
  for (const f of evidence.fields) {
    if (!allow.has(f.field)) continue;
    if (f.source?.trim()) set.add(f.source.trim());
  }
  return [...set];
}

/**
 * Deterministic why-contact one-liner.
 * Prefers score-factor pitch angle when factors exist; otherwise class + contact + evidence.
 */
export function deriveWhyContactLine(input: {
  websiteClass: WebsiteClass;
  contactability: Contactability;
  evidence?: DiscoveryEvidence;
  scoreFactors?: Record<string, number> | null;
  hasWebsite?: boolean;
}): string {
  const factors = input.scoreFactors ?? {};
  if (Object.keys(factors).length > 0) {
    return derivePitchAngle({
      factors,
      hasWebsite: input.hasWebsite ?? input.websiteClass === 'real',
    });
  }

  if (input.contactability === 'none') {
    return 'Not enough to justify outreach — verify a phone or email first.';
  }

  const sources = distinctContactSources(input.evidence);
  const sourceNote =
    sources.length >= 2
      ? ` ${sources.slice(0, 2).join(' + ')} agree.`
      : sources.length === 1
        ? ` Contact from ${sources[0]}.`
        : '';

  switch (input.websiteClass) {
    case 'none':
      return input.contactability === 'phone' || input.contactability === 'both'
        ? `No website, phone ready — call-first greenfield pitch.${sourceNote}`
        : `No website, email on file — greenfield starter pitch.${sourceNote}`;
    case 'link_in_bio':
      return `Link-in-bio only — pitch a real site that owns brand and booking.${sourceNote}`;
    case 'broken':
      return `Broken site — salvage pitch: rebuild what customers already try to visit.${sourceNote}`;
    case 'low_quality':
      return `Low-quality site (HTTPS/mobile gaps) — focused refresh pitch.${sourceNote}`;
    case 'uncertain':
      return `Site not crawl-proven yet — treat as opportunity until verified.${sourceNote}`;
    case 'real':
      return 'Owned healthy site — not a Morning Path greenfield; skip or modernize only with demand.';
    default:
      return `Validate fit on first touch.${sourceNote}`;
  }
}

export function buildWhyContactScan(input: {
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
  scoreFactors?: Record<string, number> | null;
  analysisHasWebsite?: boolean | null;
}): WhyContactScan {
  const websiteClass =
    parseWebsiteClass(input.metadata?.websiteClass) ??
    resolveWebsiteClass({ website: input.website, metadata: input.metadata });
  const contactability = contactabilityOf(input);
  const evidence = readDiscoveryEvidence(input.metadata ?? undefined);
  const evidenceFacts = topEvidenceFacts(evidence, 2);
  const conflictHint =
    evidence?.conflicts?.length
      ? evidence.conflicts
          .slice(0, 1)
          .map((c) => `${c.field} conflict across sources`)
          .join('; ')
      : null;
  const thinEvidence = evidenceFacts.length === 0;
  const whyContact = deriveWhyContactLine({
    websiteClass,
    contactability,
    evidence,
    scoreFactors: input.scoreFactors,
    hasWebsite:
      input.analysisHasWebsite ??
      (websiteClass === 'real' ? true : websiteClass === 'none' ? false : undefined),
  });

  return {
    websiteClass,
    websiteClassLabel: websiteClassLabel(websiteClass),
    contactability,
    contactabilityLabel: contactabilityLabel(contactability),
    whyContact,
    evidenceFacts,
    conflictHint,
    thinEvidence,
  };
}
