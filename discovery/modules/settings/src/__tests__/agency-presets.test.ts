import {
  agencyHasCatalog,
  buildGenericAgencyPreset,
  buildSleeklyBuiltAgencyPreset,
} from '../agency-presets';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const generic = buildGenericAgencyPreset();
assert(generic.presetId === 'generic', 'generic preset id');
assert(!agencyHasCatalog(generic), 'generic has empty catalog');
assert(generic.packages.length === 0, 'generic packages empty');

const sleek = buildSleeklyBuiltAgencyPreset();
assert(sleek.presetId === 'sleeklybuilt', 'sleeklybuilt preset id');
assert(agencyHasCatalog(sleek), 'sleeklybuilt has catalog');
assert(sleek.brandName === 'SleeklyBuilt', 'brand name');
assert(sleek.packages.some((p) => p.id === 'basic' && p.priceUgx === 250_000), 'basic package');
assert(
  sleek.services.some((s) => s.mapsToSolutionId === 'solution:corporate_website'),
  'website service remap',
);
assert(sleek.signature.includes('SleeklyBuilt'), 'signature includes brand');

console.log('ok agency presets');
console.log('7 passed, 0 failed');
