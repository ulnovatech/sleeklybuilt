import { getDiscoveryCampaign, type DiscoveryCampaign } from './campaigns';
import { getDiscoveryPack, intersectIndustries, resolvePackIndustries } from './packs';
import type { PlanFiltersConfig } from './types';

export type ResolvePlanBlueprintInput = {
  campaignId?: string | null;
  packId?: string | null;
  /** From settings.discovery.industries */
  availableIndustries: string[];
  city?: string | null;
  country?: string | null;
};

export type PlanBlueprint = {
  campaignId: string | null;
  packId: string | null;
  campaignKey: string | null;
  templateKey: string | null;
  name: string;
  description: string;
  industries: string[];
  keywords: string[];
  presence: NonNullable<PlanFiltersConfig['presence']>;
  prospectFocus: boolean;
  prospectQueryHints: string[];
};

function fallbackName(parts: {
  campaign?: DiscoveryCampaign | null;
  packLabel?: string | null;
  city?: string | null;
}): string {
  const city = parts.city?.trim() || 'Plan';
  if (parts.campaign) return parts.campaign.suggestedName(city);
  if (parts.packLabel) return `${city} ${parts.packLabel}`;
  return `${city} Discovery`;
}

/**
 * Resolve campaign and/or pack into plan create fields.
 * Industries always intersect settings.discovery.industries.
 * Campaign industries ∩ pack industries when both are set.
 */
export function resolvePlanBlueprint(input: ResolvePlanBlueprintInput): PlanBlueprint {
  const campaign = input.campaignId ? getDiscoveryCampaign(input.campaignId) : null;
  const pack = input.packId ? getDiscoveryPack(input.packId) : null;
  const available = input.availableIndustries;

  let industries: string[] = [];
  if (campaign && pack) {
    const fromCampaign = intersectIndustries(campaign.industries, available);
    const fromPack = resolvePackIndustries(pack.id, available);
    industries = intersectIndustries(fromPack, fromCampaign);
    // If intersection empty (misaligned vocab), prefer pack ∩ available then campaign ∩ available.
    if (industries.length === 0) {
      industries = fromPack.length > 0 ? fromPack : fromCampaign;
    }
  } else if (pack) {
    industries = resolvePackIndustries(pack.id, available);
  } else if (campaign) {
    industries = intersectIndustries(campaign.industries, available);
  }

  const presence = campaign?.presence ?? 'greenfield';
  const prospectFocus = campaign?.prospectFocus ?? presence === 'greenfield';
  const keywords = campaign?.keywords ?? [];
  const city = input.city?.trim() || '';
  const name = fallbackName({
    campaign,
    packLabel: pack?.label,
    city: city || undefined,
  });

  const descriptionParts = [
    campaign ? `Campaign: ${campaign.label}. ${campaign.description}` : null,
    pack ? `Pack: ${pack.label}. ${pack.description}` : null,
  ].filter(Boolean);

  return {
    campaignId: campaign?.id ?? null,
    packId: pack?.id ?? null,
    campaignKey: campaign?.id ?? null,
    templateKey: pack?.id ?? null,
    name,
    description: descriptionParts.join(' ') || '',
    industries,
    keywords,
    presence,
    prospectFocus,
    prospectQueryHints: campaign?.prospectQueryHints ?? [],
  };
}
