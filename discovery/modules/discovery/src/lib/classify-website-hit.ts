/**
 * Map search hits to ownership kinds for greenfield proof.
 * Reuses directory/social classifiers; does not treat directories as owned sites.
 */

import { isLinkInBioWebsite } from '@agency/scoring';
import {
  classifySearchResult,
  isKnownDirectoryHost,
  isLocalDirectoryHost,
} from '../providers/search-result-classifier';
import type { WebsiteHitKind } from './prospect-evidence';

const HOSTED_STOREFRONT_HOSTS = [
  'shopify.com',
  'myshopify.com',
  'wixsite.com',
  'squarespace.com',
  'webflow.io',
  'wordpress.com',
  'blogspot.',
  'github.io',
  'netlify.app',
  'vercel.app',
  'carrd.co',
  'godaddysites.com',
  'business.site',
];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url.trim()).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

function identityMatchScore(
  businessName: string,
  title: string,
  snippet: string,
  url: string,
): { score: number; matchedOn: string[] } {
  const tokens = nameTokens(businessName);
  if (tokens.length === 0) return { score: 0, matchedOn: [] };
  const hay = `${title} ${snippet} ${url}`.toLowerCase();
  const matchedOn: string[] = [];
  let hits = 0;
  for (const t of tokens) {
    if (hay.includes(t)) {
      hits++;
      matchedOn.push(t);
    }
  }
  return { score: hits / tokens.length, matchedOn };
}

export type ClassifiedWebsiteHit = {
  url: string;
  kind: WebsiteHitKind;
  title?: string;
  confidence: number;
  matchedOn: string[];
};

/**
 * Classify a single search result relative to a candidate business.
 * Directory / social / article never become owned_site.
 * Hosted storefronts can be owned_site when identity match is strong.
 */
export function classifyWebsiteHit(input: {
  link: string;
  title?: string | null;
  snippet?: string | null;
  businessName: string;
}): ClassifiedWebsiteHit {
  const link = input.link.trim();
  const title = input.title?.trim() ?? '';
  const snippet = input.snippet?.trim() ?? '';
  const { score, matchedOn } = identityMatchScore(input.businessName, title, snippet, link);
  const host = hostnameOf(link);

  if (!host) {
    return { url: link, kind: 'unrelated', confidence: 0, matchedOn, title };
  }

  if (isLinkInBioWebsite(link)) {
    return {
      url: link,
      kind: 'link_in_bio',
      confidence: Math.max(0.4, score),
      matchedOn,
      title,
    };
  }

  const classified = classifySearchResult(link, title, snippet);
  if (classified.kind === 'social_profile') {
    return { url: link, kind: 'social', confidence: Math.max(0.35, score), matchedOn, title };
  }
  if (classified.kind === 'directory' || classified.kind === 'blocked') {
    return { url: link, kind: 'directory', confidence: Math.max(0.3, score * 0.8), matchedOn, title };
  }
  if (classified.kind === 'article') {
    return { url: link, kind: 'article', confidence: score * 0.5, matchedOn, title };
  }

  if (isKnownDirectoryHost(host) || isLocalDirectoryHost(host)) {
    return { url: link, kind: 'directory', confidence: Math.max(0.3, score * 0.8), matchedOn, title };
  }

  const hosted = HOSTED_STOREFRONT_HOSTS.some((f) => host.includes(f));
  if (hosted) {
    if (score >= 0.5) {
      return {
        url: link,
        kind: 'hosted_storefront',
        confidence: Math.min(0.95, 0.55 + score * 0.4),
        matchedOn,
        title,
      };
    }
    return { url: link, kind: 'ambiguous', confidence: score, matchedOn, title };
  }

  if (score >= 0.5) {
    return {
      url: link,
      kind: 'owned_site',
      confidence: Math.min(0.98, 0.55 + score * 0.45),
      matchedOn,
      title,
    };
  }
  if (score >= 0.34) {
    return { url: link, kind: 'ambiguous', confidence: score, matchedOn, title };
  }
  return { url: link, kind: 'unrelated', confidence: score, matchedOn, title };
}

/** Credible owned business website for existing_website classification. */
export function isCredibleOwnedWebsiteHit(hit: ClassifiedWebsiteHit): boolean {
  if (hit.kind === 'owned_site' && hit.confidence >= 0.55) return true;
  if (hit.kind === 'hosted_storefront' && hit.confidence >= 0.6) return true;
  return false;
}
