import { createHash } from 'crypto';
import { platformSettings } from '@agency/settings';
import { attachDiscoveryEvidence } from '@agency/validation';
import { platformsForSocialSearch } from '../../lib/build-social-search-queries';
import type { DiscoveredBusiness, DiscoverySearchParams, DiscoverySource } from '../types';
import {
  classifySearchResult,
  type SocialPlatform,
} from '../search-result-classifier';
import type { SearchResultItem } from '../parse-search-results';

const SOCIAL_PLATFORMS: SocialPlatform[] = ['tiktok', 'linkedin', 'youtube', 'twitter'];

/** Map classifier platform → query-builder platform id (twitter → x). */
function queryPlatformFor(platform: SocialPlatform): 'tiktok' | 'linkedin' | 'youtube' | 'x' | null {
  if (platform === 'tiktok') return 'tiktok';
  if (platform === 'linkedin') return 'linkedin';
  if (platform === 'youtube') return 'youtube';
  if (platform === 'twitter') return 'x';
  return null;
}

function hashLink(link: string): string {
  return createHash('sha256').update(link).digest('hex').slice(0, 24);
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[-|–—]\s*(Facebook|Instagram|TikTok|LinkedIn|YouTube|X|Twitter).*$/i, '')
    .replace(/\s*\|\s*.*$/, '')
    .replace(/\s+on\s+(Facebook|Instagram|TikTok|LinkedIn|YouTube|X|Twitter)\s*$/i, '')
    .replace(/\s*\(@[^)]+\)\s*$/i, '')
    .trim();
}

function sourceForPlatform(platform: SocialPlatform): DiscoverySource {
  if (platform === 'facebook') return 'facebook';
  if (platform === 'instagram') return 'instagram';
  return 'social_search';
}

function applySocialUrl(
  business: DiscoveredBusiness,
  platform: SocialPlatform,
  link: string,
): void {
  switch (platform) {
    case 'facebook':
      business.facebookUrl = link;
      break;
    case 'instagram':
      business.instagramUrl = link;
      break;
    case 'tiktok':
      business.metadata = { ...business.metadata, tiktokUrl: link };
      break;
    case 'linkedin':
      business.metadata = { ...business.metadata, linkedinUrl: link };
      break;
    case 'youtube':
      business.metadata = { ...business.metadata, youtubeUrl: link };
      break;
    case 'twitter':
      business.metadata = { ...business.metadata, twitterUrl: link };
      break;
  }
}

export function parseSocialSearchResultItem(
  item: SearchResultItem,
  params: DiscoverySearchParams,
  query: string,
): DiscoveredBusiness | null {
  if (!item.title?.trim() || !item.link?.trim()) return null;

  const classification = classifySearchResult(item.link, item.title, item.snippet);
  if (classification.kind !== 'social_profile' || !classification.platform) return null;
  if (!SOCIAL_PLATFORMS.includes(classification.platform)) return null;

  const allowed = platformsForSocialSearch(params.socialSearch);
  const queryPlatform = queryPlatformFor(classification.platform);
  if (!queryPlatform || !allowed.includes(queryPlatform)) return null;

  const link = item.link.trim();
  const name = cleanTitle(item.title);
  if (name.length < 2) return null;

  const platform = classification.platform;
  const business: DiscoveredBusiness = {
    name,
    industry: params.industry,
    country: params.country,
    city: platformSettings.isAllCities(params.city) ? undefined : params.city,
    source: sourceForPlatform(platform),
    sourceUrl: link,
    externalId: `social:${platform}:${hashLink(link)}`,
    metadata: {
      searchQuery: query,
      snippet: item.snippet,
      resultKind: 'social_profile',
      primaryPlatform: platform,
      discoveryChannel: 'social_search',
    },
  };

  applySocialUrl(business, platform, link);
  return attachDiscoveryEvidence(business, {
    sourceUrl: { method: 'social_search.profile', confidence: 'high' },
    youtubeUrl: { method: 'social_search.youtube', confidence: 'high' },
    tiktokUrl: { method: 'social_search.tiktok', confidence: 'high' },
    linkedinUrl: { method: 'social_search.linkedin', confidence: 'high' },
    twitterUrl: { method: 'social_search.x', confidence: 'high' },
    facebookUrl: { method: 'social_search.profile', confidence: 'high' },
    instagramUrl: { method: 'social_search.profile', confidence: 'high' },
  });
}
