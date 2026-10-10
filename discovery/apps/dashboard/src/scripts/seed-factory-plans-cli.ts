import { loadRootEnv } from '@agency/config/load-env';
import { closeDb } from '@agency/database';
import { ensureFactoryPlans, getFactoryCredentialHealth } from '@agency/discovery';

loadRootEnv();

async function main() {
  const result = await ensureFactoryPlans();
  console.log('Factory plans:');
  console.log(`  Core (${result.core}): ${result.corePlanId}`);
  console.log(`  Explore (${result.explore}): ${result.explorePlanId}`);
  console.log(
    `  Places monthly cap: ${result.placesCap}${result.placesCapRaised ? ' (raised to factory floor)' : ''}`,
  );
  if (result.defaultGeoPatched) {
    console.log('  Discovery default geo: Uganda / Kampala (was United States)');
  }
  if (result.cseCxPersisted) {
    console.log('  Persisted GOOGLE_CSE_CX from env into Settings');
  }
  const health = await getFactoryCredentialHealth();
  console.log(`Factory harvest ready: ${health.ready ? 'yes' : 'no'}`);
  for (const check of health.checks) {
    const flag = check.ready ? 'ready' : check.required ? 'MISSING' : 'optional-off';
    console.log(`  ${check.label}: ${flag}${check.reason ? ` — ${check.reason}` : ''}`);
  }
  if (!health.ready) {
    console.log(
      'Factory blocked — enable OSM (default) or add Brave Search / Meta token. Places is optional while dormant. Run pnpm discovery:factory-health.',
    );
  } else if (health.survivalMode) {
    console.log(`Plan B survivalMode=yes · Places ${health.placesLifecycle}`);
  }
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
