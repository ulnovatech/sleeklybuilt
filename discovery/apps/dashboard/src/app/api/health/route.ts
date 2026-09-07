import { dynamic } from '@/lib/route-config';
export { dynamic };
import { getWorkerHeartbeat, isWorkerHeartbeatStale } from '@agency/acquisition';
import { acquisitionJobs, getDb, pingDb } from '@agency/database';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const dbOk = await pingDb();
  let workerLastSeenAt: string | null = null;
  let workerStale = true;
  let pendingJobs = 0;
  let runningJobs = 0;

  if (dbOk) {
    try {
      const heartbeat = await getWorkerHeartbeat();
      workerLastSeenAt = heartbeat?.at ?? null;
      workerStale = isWorkerHeartbeatStale(heartbeat);

      const db = getDb();
      const [pendingRow, runningRow] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(acquisitionJobs)
          .where(eq(acquisitionJobs.status, 'pending')),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(acquisitionJobs)
          .where(eq(acquisitionJobs.status, 'running')),
      ]);
      pendingJobs = pendingRow[0]?.count ?? 0;
      runningJobs = runningRow[0]?.count ?? 0;
    } catch {
      /* keep defaults; health still reports DB */
    }
  }

  const workerOk = dbOk && !workerStale;
  const status = !dbOk ? 'degraded' : workerOk ? 'ok' : 'degraded';

  return NextResponse.json({
    status,
    version: '1.0.0',
    database: dbOk ? 'connected' : 'disconnected',
    worker: {
      lastSeenAt: workerLastSeenAt,
      stale: workerStale,
    },
    queue: {
      pending: pendingJobs,
      running: runningJobs,
    },
    timestamp: new Date().toISOString(),
  });
}
