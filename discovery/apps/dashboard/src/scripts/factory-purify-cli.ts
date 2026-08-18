import { loadRootEnv } from '@agency/config/load-env';
import { closeDb } from '@agency/database';
import { runFactoryPurifyTick } from '../lib/factory-purify';

loadRootEnv();

async function main() {
  const force = process.argv.includes('--force');
  const result = await runFactoryPurifyTick({ ignoreWindow: true, force });
  console.log(`Harvest ${result.harvestDate} → sell ${result.sellDate}`);
  if (result.skipped && result.reason === 'already_frozen') {
    console.log('Cohort already frozen. Re-run with --force to rebuild.');
  } else if (result.reason === 'empty_harvest' || result.reason === 'error') {
    console.log(`FAILED CLOSED: ${result.errorMessage ?? result.reason}`);
    console.log('Did not ship a dirty morning list. Last good frozen cohort remains the fallback.');
  } else if (!result.skipped) {
    console.log(`Frozen ${result.keeperCount ?? 0} keepers, ${result.dumpsterCount ?? 0} dumpster.`);
  } else {
    console.log(`Skipped (${result.reason ?? 'ok'}).`);
  }
  if (result.promoted || result.prewarmed) {
    console.log(`Promoted ${result.promoted ?? 0} keepers, pre-warmed ${result.prewarmed ?? 0} case files.`);
  }
  const failed = result.reason === 'empty_harvest' || result.reason === 'error';
  await closeDb();
  process.exit(failed ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await closeDb().catch(() => undefined);
  process.exit(1);
});
