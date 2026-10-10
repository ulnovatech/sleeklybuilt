import fs from 'node:fs';
import path from 'node:path';
import { logger } from '@agency/config';
import {
  GEOFABRIK_UGANDA_PBF_URL,
  resolveGeofabrikPaths,
  type GeofabrikPaths,
} from './geofabrik-paths';

export type GeofabrikDownloadResult = {
  pbfPath: string;
  bytes: number;
  url: string;
};

/**
 * Download Geofabrik Uganda PBF to OSM_PBF_PATH (atomic replace via .partial).
 */
export async function downloadGeofabrikUgandaPbf(
  paths: GeofabrikPaths = resolveGeofabrikPaths(),
  url = process.env.OSM_GEOFABRIK_URL?.trim() || GEOFABRIK_UGANDA_PBF_URL,
): Promise<GeofabrikDownloadResult> {
  fs.mkdirSync(paths.dir, { recursive: true });
  const partial = `${paths.pbfPath}.partial`;

  logger.info('Geofabrik PBF download started', { url, dest: paths.pbfPath });

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        process.env.OSM_USER_AGENT?.trim() ||
        'SleeklyBuiltDiscovery/1.0 (+https://sleeklybuilt.com; geofabrik refresh)',
    },
  });

  if (!res.ok || !res.body) {
    throw new Error(`Geofabrik download failed: HTTP ${res.status} from ${url}`);
  }

  const out = fs.createWriteStream(partial);
  const reader = res.body.getReader();
  let bytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      bytes += value.byteLength;
      if (!out.write(Buffer.from(value))) {
        await new Promise<void>((resolve) => out.once('drain', () => resolve()));
      }
    }
    await new Promise<void>((resolve, reject) => {
      out.end(() => resolve());
      out.on('error', reject);
    });
  } catch (err) {
    out.destroy();
    try {
      fs.unlinkSync(partial);
    } catch {
      /* ignore */
    }
    throw err;
  }

  fs.renameSync(partial, paths.pbfPath);
  logger.info('Geofabrik PBF download complete', {
    path: paths.pbfPath,
    bytes,
    dir: path.dirname(paths.pbfPath),
  });

  return { pbfPath: paths.pbfPath, bytes, url };
}
