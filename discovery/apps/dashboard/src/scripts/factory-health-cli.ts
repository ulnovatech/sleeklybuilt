import { loadRootEnv } from '@agency/config/load-env';
import { closeDb } from '@agency/database';
import { getFactoryCredentialHealth, PlacesApiClient } from '@agency/discovery';

loadRootEnv();

async function probePlaces(): Promise<string> {
  const client = new PlacesApiClient();
  if (!(await client.isConfigured())) {
    return 'skipped — Places not configured';
  }
  try {
    const result = await client.textSearch('restaurant Kampala', 'UG', undefined, { pageSize: 1 });
    const n = result?.places?.length ?? 0;
    return n > 0
      ? `ok — ${n} result(s) for probe query`
      : 'ok — key accepted, 0 places for probe query';
  } catch (err) {
    return `failed — ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function main() {
  const probe = process.argv.includes('--probe');
  const health = await getFactoryCredentialHealth();
  for (const check of health.checks) {
    const flag = check.ready ? 'ready' : check.required ? 'MISSING' : 'optional-off';
    console.log(`${check.label}: ${flag}${check.reason ? ` — ${check.reason}` : ''}`);
  }
  console.log(`Factory harvest ready: ${health.ready ? 'yes' : 'no'}`);
  if (probe) {
    console.log(`Places Text Search probe: ${await probePlaces()}`);
  } else if (health.ready) {
    console.log('Places key is present. Re-run with --probe to spend 1 Text Search and confirm Maps rows.');
  } else {
    console.log('Add a Google Places API key in Settings → API credentials, then re-run this command.');
  }
  await closeDb();
  process.exit(health.ready ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
