import { logger } from '@agency/config';
import { DEFAULT_INDUSTRIES, platformSettings } from '@agency/settings';
import { getDiscoveryCampaign } from './campaigns';
import { syncFactoryCredentialFallbacks } from './factory-credentials';
import { intersectIndustries } from './packs';
import { DiscoveryPlanService } from './plan-service';
import {
  FACTORY_CADENCE,
  FACTORY_CORE_LIMITS,
  FACTORY_CORE_TEMPLATE_KEY,
  FACTORY_EXPLORE_LIMITS,
  FACTORY_EXPLORE_TEMPLATE_KEY,
  FACTORY_FILTERS,
  FACTORY_PLACES_MONTHLY_FLOOR,
  buildFactoryTargets,
  marketsForTiers,
} from './factory-markets';

export type EnsureFactoryPlansResult = {
  core: 'created' | 'exists';
  explore: 'created' | 'exists';
  corePlanId: string;
  explorePlanId: string;
  placesCap: number;
  placesCapRaised: boolean;
  defaultGeoPatched: boolean;
  cseCxPersisted: boolean;
};

function factoryIndustries(available: string[]): string[] {
  const campaign = getDiscoveryCampaign('website_build');
  const preferred = campaign?.industries ?? ['Restaurant', 'Salon & Spa', 'Automotive'];
  const hit = intersectIndustries(preferred, available);
  return hit.length > 0 ? hit : intersectIndustries(preferred, [...DEFAULT_INDUSTRIES]);
}

async function ensurePlacesMonthlyFloor(): Promise<{ cap: number; raised: boolean }> {
  await platformSettings.ensureLoaded();
  const current = platformSettings.getSync().acquisition.caps.google_places;
  if (current >= FACTORY_PLACES_MONTHLY_FLOOR) {
    return { cap: current, raised: false };
  }
  await platformSettings.updateAcquisition({
    caps: {
      ...platformSettings.getSync().acquisition.caps,
      google_places: FACTORY_PLACES_MONTHLY_FLOOR,
    },
  });
  logger.info('Factory seed raised Places monthly cap', {
    from: current,
    to: FACTORY_PLACES_MONTHLY_FLOOR,
  });
  return { cap: FACTORY_PLACES_MONTHLY_FLOOR, raised: true };
}

async function ensureDefaultGeoUganda(): Promise<boolean> {
  await platformSettings.ensureLoaded();
  const defaults = platformSettings.getSync().discovery.defaults;
  if (defaults.country !== 'United States') return false;
  await platformSettings.updateDiscovery({
    defaults: {
      ...defaults,
      country: 'Uganda',
      city: 'Kampala',
    },
  });
  logger.info('Factory seed moved discovery default geo to Uganda / Kampala');
  return true;
}

/**
 * Idempotent: creates Plan A (core) and Plan B (explore) if missing.
 * Does not overwrite operator edits on existing factory plans.
 */
export async function ensureFactoryPlans(
  createdBy = 'factory-seed',
): Promise<EnsureFactoryPlansResult> {
  await platformSettings.ensureLoaded();
  const { cap: placesCap, raised: placesCapRaised } = await ensurePlacesMonthlyFloor();
  const defaultGeoPatched = await ensureDefaultGeoUganda();
  const { cseCxPersisted } = await syncFactoryCredentialFallbacks();

  const available = platformSettings.getSync().discovery.industries;
  const industries = factoryIndustries(available);
  if (industries.length === 0) {
    throw new Error('Factory plans need at least one website-build industry in settings');
  }

  const plans = new DiscoveryPlanService();
  const repo = plans.repoPublic;

  const coreTargets = buildFactoryTargets(marketsForTiers(['core']), industries);
  const exploreTargets = buildFactoryTargets(marketsForTiers(['explore', 'probe']), industries);

  const upsert = async (
    templateKey: string,
    spec: {
      name: string;
      description: string;
      targets: ReturnType<typeof buildFactoryTargets>;
      limits: typeof FACTORY_CORE_LIMITS;
      priority: number;
    },
  ): Promise<{ id: string; status: 'created' | 'exists' }> => {
    const existing = await repo.getPlanByTemplateKey(templateKey);
    if (existing) {
      return { id: existing.id, status: 'exists' };
    }
    const { plan } = await plans.createPlan(
      {
        name: spec.name,
        description: spec.description,
        planType: 'discovery',
        status: 'active',
        sources: ['google_maps'],
        targets: spec.targets,
        filters: { ...FACTORY_FILTERS, presence: 'greenfield' },
        runProfile: 'standard',
        prospectFocus: true,
        boiNarrative: false,
        campaignKey: 'website_build',
        templateKey,
        cadence: FACTORY_CADENCE,
        limits: spec.limits,
        priority: spec.priority,
        scheduleImmediately: true,
      },
      createdBy,
    );
    return { id: plan.id, status: 'created' };
  };

  const core = await upsert(FACTORY_CORE_TEMPLATE_KEY, {
    name: 'Factory A — Core reach',
    description:
      'Automated weekday harvest (EAT). Uganda, Kenya, Nigeria — named cities, website-build greenfield, Places primary.',
    targets: coreTargets,
    limits: FACTORY_CORE_LIMITS,
    priority: 20,
  });

  const explore = await upsert(FACTORY_EXPLORE_TEMPLATE_KEY, {
    name: 'Factory B — Explore',
    description:
      'Lower-priority harvest: Ghana, Tanzania, Philippines plus Houston/Birmingham probes. Same greenfield campaign.',
    targets: exploreTargets,
    limits: FACTORY_EXPLORE_LIMITS,
    priority: 5,
  });

  logger.info('Factory plans ready', {
    core: core.status,
    explore: explore.status,
    corePlanId: core.id,
    explorePlanId: explore.id,
    industries: industries.length,
  });

  return {
    core: core.status,
    explore: explore.status,
    corePlanId: core.id,
    explorePlanId: explore.id,
    placesCap,
    placesCapRaised,
    defaultGeoPatched,
    cseCxPersisted,
  };
}
