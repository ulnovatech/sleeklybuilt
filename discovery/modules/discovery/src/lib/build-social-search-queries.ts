import type { DiscoverySearchParams } from '../providers/types';
import { locationPhrase } from './discovery-query-helpers';
import { expandIndustryTerms } from './industry-search-terms';

export type SocialSearchPlatform = 'tiktok' | 'linkedin' | 'youtube' | 'x';
export type SocialSearchMode = NonNullable<DiscoverySearchParams['socialSearch']>;

const ALL_SOCIAL_PLATFORMS: SocialSearchPlatform[] = ['tiktok', 'linkedin', 'youtube', 'x'];

export function platformsForSocialSearch(mode?: SocialSearchMode): SocialSearchPlatform[] {
  if (mode === 'off') return [];
  if (mode === 'tiktok') return ['tiktok'];
  if (mode === 'youtube') return ['youtube'];
  return ALL_SOCIAL_PLATFORMS;
}

/**
 * Social platform `site:` queries for TikTok, LinkedIn, X, and YouTube.
 * Facebook/Instagram are handled by Meta Graph (P5-D9).
 * Factory Plan B uses `socialSearch: 'youtube'` only.
 */
export function buildSocialSearchQueries(
  params: DiscoverySearchParams,
  maxSocial = 5,
): string[] {
  const platforms = platformsForSocialSearch(params.socialSearch);
  if (platforms.length === 0 || maxSocial <= 0) return [];

  const terms = expandIndustryTerms(params.industry, 2);
  const location = locationPhrase(params);
  const queries: string[] = [];

  for (const term of terms) {
    if (platforms.includes('tiktok')) queries.push(`site:tiktok.com ${term} ${location}`);
    if (platforms.includes('linkedin')) queries.push(`site:linkedin.com/company ${term} ${location}`);
    if (platforms.includes('youtube')) queries.push(`site:youtube.com ${term} ${location}`);
    if (platforms.includes('x')) {
      queries.push(`site:twitter.com ${term} ${location}`);
      queries.push(`site:x.com ${term} ${location}`);
    }
  }

  return [...new Set(queries)].slice(0, Math.max(0, maxSocial));
}
