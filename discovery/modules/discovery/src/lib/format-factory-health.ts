/**
 * Pure Plan B factory-health report lines (Chunk 10).
 * CLI prints these after loading live health + Geofabrik status.
 */

import type { FactoryCredentialHealth } from '../plans/factory-credentials';
import type { GeofabrikExtractStatus } from '../providers/osm/geofabrik-refresh';

export function formatFactoryHealthHeader(
  health: Pick<FactoryCredentialHealth, 'ready' | 'survivalMode' | 'placesLifecycle'>,
  extract: Pick<GeofabrikExtractStatus, 'summary' | 'builtAt' | 'paths'>,
): string[] {
  const lines = [
    '=== Plan B factory health ===',
    `Places lifecycle: ${health.placesLifecycle}${
      health.survivalMode ? ' · survivalMode=yes (Plan B harvest)' : ' · survivalMode=no'
    }`,
    `Factory harvest ready: ${health.ready ? 'yes' : 'no'}`,
    `Geofabrik: ${extract.summary}`,
  ];
  if (extract.builtAt) {
    lines.push(`  builtAt=${extract.builtAt} path=${extract.paths.indexPath}`);
  }
  return lines;
}

export function formatFactoryHealthCheckLine(check: {
  label: string;
  ready: boolean;
  required: boolean;
  reason?: string;
  lifecycle?: string;
}): string {
  const flag = check.ready ? 'ready' : check.required ? 'MISSING' : 'optional-off';
  const life = check.lifecycle ? ` [${check.lifecycle}]` : '';
  return `${check.label}${life}: ${flag}${check.reason ? ` — ${check.reason}` : ''}`;
}
