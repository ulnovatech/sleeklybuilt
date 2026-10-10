import { isLinkInBioWebsite } from '@agency/scoring';

/**
 * Website opportunity class (Plan B Chunk 07).
 * - none / link_in_bio — greenfield at ingest
 * - uncertain — URL present but crawl inconclusive or not yet crawled
 * - broken — crawl proved unreachable (DNS/timeout/connect/HTTP fail)
 * - low_quality — crawl ok but HTTPS or mobile failed
 * - real — crawl-proven healthy owned site (excluded from Morning Path)
 */
export type WebsiteClass =
  | 'none'
  | 'link_in_bio'
  | 'uncertain'
  | 'broken'
  | 'low_quality'
  | 'real';

export type CrawlStatusForWebsiteClass =
  | 'ok'
  | 'blocked'
  | 'unreachable'
  | 'no_website'
  | 'skipped'
  | 'budget_exhausted'
  | string;

export function isWebsiteClass(value: unknown): value is WebsiteClass {
  return (
    value === 'none' ||
    value === 'link_in_bio' ||
    value === 'uncertain' ||
    value === 'broken' ||
    value === 'low_quality' ||
    value === 'real'
  );
}

export function parseWebsiteClass(value: unknown): WebsiteClass | undefined {
  return isWebsiteClass(value) ? value : undefined;
}

/**
 * URL-only classification at ingest.
 * Uncrawled non-link-in-bio URLs are `uncertain` (not `real`) so Morning Path can
 * keep them until crawl proves quality — broken sites must be able to enter keepers.
 */
export function classifyWebsiteClass(website?: string | null): WebsiteClass {
  const url = website?.trim();
  if (!url) return 'none';
  return isLinkInBioWebsite(url) ? 'link_in_bio' : 'uncertain';
}

/** Map crawl outcomes → website class (authoritative after analyze). */
export function deriveWebsiteClassFromCrawl(input: {
  website?: string | null;
  crawlStatus: CrawlStatusForWebsiteClass;
  httpsEnabled?: boolean | null;
  mobileFriendly?: boolean | null;
}): WebsiteClass {
  const url = input.website?.trim();
  if (!url || input.crawlStatus === 'no_website') {
    return url && isLinkInBioWebsite(url) ? 'link_in_bio' : 'none';
  }
  if (isLinkInBioWebsite(url)) return 'link_in_bio';

  if (input.crawlStatus === 'unreachable') return 'broken';
  if (
    input.crawlStatus === 'blocked' ||
    input.crawlStatus === 'budget_exhausted' ||
    input.crawlStatus === 'skipped'
  ) {
    return 'uncertain';
  }

  if (input.crawlStatus === 'ok') {
    if (input.httpsEnabled === false || input.mobileFriendly === false) {
      return 'low_quality';
    }
    return 'real';
  }

  return 'uncertain';
}

export function resolveWebsiteClass(item: {
  website?: string | null;
  metadata?: Record<string, unknown> | null;
}): WebsiteClass {
  const tagged = parseWebsiteClass(item.metadata?.websiteClass);
  if (tagged) return tagged;
  return classifyWebsiteClass(item.website);
}

/** Morning list keeps greenfield + crawl-proven weak/broken/uncertain. Owned healthy sites go to dumpster. */
export function keepOnMorningPath(item: {
  website?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return resolveWebsiteClass(item) !== 'real';
}

/** Scoring / acquisition lane: only crawl-proven healthy owned sites count as “has website”. */
export function countsAsOwnedWebsiteForScoring(cls: WebsiteClass): boolean {
  return cls === 'real';
}

export function websiteClassLabel(cls: WebsiteClass): string {
  switch (cls) {
    case 'none':
      return 'No website';
    case 'link_in_bio':
      return 'Link-in-bio';
    case 'uncertain':
      return 'Uncertain site';
    case 'broken':
      return 'Broken site';
    case 'low_quality':
      return 'Low-quality site';
    case 'real':
      return 'Owned website';
    default:
      return cls;
  }
}

const CRAWL_PROVEN: ReadonlySet<WebsiteClass> = new Set(['real', 'broken', 'low_quality']);

/**
 * Merge websiteClass across rediscovery.
 * Never let ingest `uncertain` downgrade crawl-proven real/broken/low_quality
 * (known_fresh skips re-crawl, so overwrite would leak owned sites into keepers).
 */
export function mergeWebsiteClass(
  existing: unknown,
  incoming: unknown,
): WebsiteClass | undefined {
  const prev = parseWebsiteClass(existing);
  const next = parseWebsiteClass(incoming);
  if (!next) return prev;
  if (!prev) return next;
  if (next === 'uncertain' && CRAWL_PROVEN.has(prev)) return prev;
  if (prev === 'uncertain' && CRAWL_PROVEN.has(next)) return next;
  if (CRAWL_PROVEN.has(next)) return next;
  if (CRAWL_PROVEN.has(prev)) return prev;
  return next;
}
