import {
  listDiscoveryCampaigns,
  listDiscoveryPacks,
  resolvePlanBlueprint,
} from '@agency/discovery';
import { platformSettings } from '@agency/settings';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await platformSettings.ensureLoaded();
    const industries = platformSettings.getSync().discovery.industries;
    const campaigns = listDiscoveryCampaigns().map((c) => {
      const blueprint = resolvePlanBlueprint({
        campaignId: c.id,
        availableIndustries: industries,
      });
      return {
        id: c.id,
        label: c.label,
        description: c.description,
        presence: c.presence,
        prospectFocus: c.prospectFocus,
        keywords: c.keywords,
        prospectQueryHints: c.prospectQueryHints,
        industries: blueprint.industries,
        industryCount: blueprint.industries.length,
      };
    });
    const packs = listDiscoveryPacks().map((p) => {
      const blueprint = resolvePlanBlueprint({
        packId: p.id,
        availableIndustries: industries,
      });
      return {
        id: p.id,
        label: p.label,
        description: p.description,
        industries: blueprint.industries,
        industryCount: blueprint.industries.length,
      };
    });
    return NextResponse.json({ campaigns, packs, availableIndustries: industries });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
