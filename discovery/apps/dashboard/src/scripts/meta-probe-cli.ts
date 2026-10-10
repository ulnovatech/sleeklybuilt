import { loadRootEnv } from '@agency/config/load-env';
import { closeDb } from '@agency/database';
import {
  evaluateMetaPagesSearchCapability,
  MetaGraphClient,
  metaPagesSearchGateReason,
} from '@agency/discovery';
import { platformSettings } from '@agency/settings';

loadRootEnv();

function resolveQuery(): string {
  const qFlag = process.argv.find((a) => a.startsWith('--q='))?.slice(4)?.trim();
  if (qFlag) return qFlag;
  const positional = process.argv[2];
  if (positional && !positional.startsWith('--')) return positional.trim();
  return 'restaurant Kampala';
}

async function main() {
  await platformSettings.ensureLoaded();
  const query = resolveQuery();

  const before = evaluateMetaPagesSearchCapability();
  console.log(`Gate before probe: ${before.status} — ${before.reason}`);

  const client = new MetaGraphClient();
  if (!client.isConfigured()) {
    console.log('No Meta Graph token (Settings → Meta Graph API Token or META_GRAPH_API_TOKEN).');
    console.log('Documented RED: Pages Search unavailable until a token + App Review access exist.');
    await closeDb();
    process.exit(1);
  }

  const result = await client.probePagesSearch(query);
  console.log(`Probe: ${result.status.toUpperCase()} — ${result.reason}`);
  console.log(`Sample pages: ${result.sampleCount}`);
  console.log(`Gate after: ${metaPagesSearchGateReason()}`);
  if (result.ok) {
    console.log(
      'GREEN path ready — factory Meta discover uses GET /pages/search (FB + linked IG rows).',
    );
  } else {
    console.log(
      'RED gate — submit Page Public Metadata Access (App Review) or set META_PAGES_SEARCH_READY=true after manual verification.',
    );
  }

  await closeDb();
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
