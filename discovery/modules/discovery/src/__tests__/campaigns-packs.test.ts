import { resolvePlanBlueprint } from '../plans/resolve-blueprint';
import { expandPlanTargets } from '../plans/expand-targets';
import { DEFAULT_INDUSTRIES } from '@agency/settings';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const available = [...DEFAULT_INDUSTRIES];

const websiteBuild = resolvePlanBlueprint({
  campaignId: 'website_build',
  availableIndustries: available,
  city: 'Kampala',
});
assert(websiteBuild.presence === 'greenfield', 'website_build is greenfield');
assert(websiteBuild.prospectFocus === true, 'website_build prospect focus');
assert(websiteBuild.industries.length >= 5, 'website_build multi-industry');
assert(websiteBuild.name.includes('Kampala'), 'suggested name includes city');
assert(websiteBuild.campaignKey === 'website_build', 'campaignKey set');

const segments = expandPlanTargets({
  countries: ['Uganda'],
  citiesByCountry: { Uganda: ['Kampala'] },
  industries: websiteBuild.industries,
});
assert(segments.length === websiteBuild.industries.length, 'one segment per industry for Kampala');
assert(
  segments.every((s) => s.city === 'Kampala' && s.country === 'Uganda'),
  'segments geo locked to Kampala Uganda',
);

const modernization = resolvePlanBlueprint({
  campaignId: 'modernization',
  availableIndustries: available,
  city: 'Kampala',
});
assert(modernization.presence === 'redesign', 'modernization is redesign lane');
assert(modernization.prospectFocus === false, 'modernization not prospect-focus default');

const health = resolvePlanBlueprint({
  packId: 'health',
  availableIndustries: available,
});
assert(health.industries.includes('Healthcare'), 'health pack includes Healthcare');
assert(health.industries.includes('Dental'), 'health pack includes Dental');
assert(!health.industries.includes('Restaurant'), 'health pack excludes Restaurant');

const combined = resolvePlanBlueprint({
  campaignId: 'website_build',
  packId: 'health',
  availableIndustries: available,
  city: 'Kampala',
});
assert(
  combined.industries.every((i) => health.industries.includes(i)),
  'campaign+pack industries subset of pack',
);
assert(combined.presence === 'greenfield', 'campaign presence wins');
assert(combined.templateKey === 'health', 'pack stored as templateKey');

const emptyAvail = resolvePlanBlueprint({
  campaignId: 'website_build',
  availableIndustries: ['Totally Unknown Industry'],
});
assert(emptyAvail.industries.length === 0, 'no match when industries missing from settings');

console.log('ok website_build + Kampala expands multi-industry greenfield');
console.log('ok modernization stays redesign lane');
console.log('ok packs intersect settings industries');
console.log('ok campaign+pack combine');
console.log('5 passed, 0 failed');
