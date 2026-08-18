import { loadRootEnv } from '@agency/config/load-env';
import { ensureFactoryPlans, getFactoryCredentialHealth } from '@agency/discovery';
import { workerTick } from '../lib/job-worker';

loadRootEnv();

const POLL_MS = 2000;

async function loop() {
  try {
    const factory = await ensureFactoryPlans();
    console.log(
      `Factory plans ready — core ${factory.core}, explore ${factory.explore}; Places cap ${factory.placesCap}`,
    );
    if (factory.cseCxPersisted) {
      console.log('Persisted GOOGLE_CSE_CX from env into Settings.');
    }
    const health = await getFactoryCredentialHealth();
    console.log(`Factory harvest ready: ${health.ready ? 'yes' : 'no'}`);
    for (const check of health.checks.filter((c) => !c.ready)) {
      console.warn(`  ${check.label}: ${check.reason ?? 'not ready'}`);
    }
  } catch (err) {
    console.error('Factory plan seed failed (worker still running):', err);
  }

  console.log(`Job worker started — polling every ${POLL_MS}ms (reclaim stale + heartbeat)`);
  for (;;) {
    try {
      const worked = await workerTick();
      if (!worked) await new Promise((r) => setTimeout(r, POLL_MS));
    } catch (err) {
      console.error('Worker error:', err);
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

loop().catch((err) => {
  console.error(err);
  process.exit(1);
});
