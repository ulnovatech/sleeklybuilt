import { loadRootEnv } from '@agency/config/load-env';
import { closeDb } from '@agency/database';
import {
  formatFactoryHealthCheckLine,
  formatFactoryHealthHeader,
  geofabrikExtractStatus,
  getFactoryCredentialHealth,
  PlacesApiClient,
} from '@agency/discovery';

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
  const extract = geofabrikExtractStatus();

  for (const line of formatFactoryHealthHeader(health, extract)) {
    console.log(line);
  }
  console.log('--- checks ---');
  for (const check of health.checks) {
    console.log(formatFactoryHealthCheckLine(check));
  }

  if (probe) {
    if (health.placesLifecycle === 'dormant') {
      console.log(
        'Places Text Search probe: skipped — Places dormant (use OSM Geofabrik / Brave / Meta instead)',
      );
      console.log(
        `OSM extract probe: ${extract.indexReady ? 'index ready' : 'index missing'} · stale=${extract.stale}`,
      );
    } else {
      console.log(`Places Text Search probe: ${await probePlaces()}`);
    }
  } else if (health.ready && health.survivalMode) {
    console.log(
      'Plan B path is ready (OSM and/or Brave/Meta). Re-run with --probe to confirm Places only when active.',
    );
    if (extract.stale) {
      console.log('Tip: refresh Geofabrik weekly — pnpm discovery:osm-geofabrik');
    }
  } else if (health.ready) {
    console.log('Places key is present. Re-run with --probe to spend 1 Text Search and confirm Maps rows.');
  } else {
    console.log(
      'Factory blocked — enable OSM (default) or add Brave Search / Meta token. CSV is resilience for manual runs, not a factory-ready channel alone. Places is optional while dormant.',
    );
  }

  await closeDb();
  process.exit(health.ready ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
