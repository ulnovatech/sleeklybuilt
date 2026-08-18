import { isLinkInBioWebsite } from '@agency/scoring';

export type WebsiteClass = 'none' | 'link_in_bio' | 'real';

export function classifyWebsiteClass(website?: string | null): WebsiteClass {
  const url = website?.trim();
  if (!url) return 'none';
  return isLinkInBioWebsite(url) ? 'link_in_bio' : 'real';
}

/** Morning list keeps no-site and link-in-bio. Owned websites go to dumpster later, not the pool. */
export function keepOnMorningPath(item: {
  website?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const tagged = item.metadata?.websiteClass;
  const cls: WebsiteClass =
    tagged === 'none' || tagged === 'link_in_bio' || tagged === 'real'
      ? tagged
      : classifyWebsiteClass(item.website);
  return cls !== 'real';
}
