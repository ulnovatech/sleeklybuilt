import {
  BudgetGovernor,
  getWorkerHeartbeat,
  isWorkerHeartbeatStale,
} from '@agency/acquisition';
import { getDb } from '@agency/database';
import { DEMAND_INGEST_RUN_ID } from '@agency/intent';
import { prospectVerifiedSql } from '@agency/qualification';
import { OPERATING_KPI_TARGETS, platformSettings } from '@agency/settings';
import { sql } from 'drizzle-orm';
import { formatPercent, formatRateLabel } from './metrics-format';
import { loadRevenueMetrics, type RevenueOpsMetrics } from './revenue-metrics';
import { loadLearningMetrics, type LearningOpsMetrics } from './learning-metrics';

const WINDOW_DAYS = 7;

export type OpsKpiRow = {
  id: string;
  label: string;
  target: string;
  measurement: string;
  value: number | string | null;
};

/** Morning command cards — “what happened while I was away?” */
export type MorningInboxItem = {
  id:
    | 'new_qualified'
    | 'plans_completed'
    | 'review_required'
    | 'outreach_ready'
    | 'failed_jobs';
  label: string;
  count: number;
  hint: string;
  href: string;
};

export type MorningInbox = {
  since: string;
  items: MorningInboxItem[];
};

export type OpsMetrics = {
  generatedAt: string;
  funnel: Record<string, number>;
  reviewQueue: { verified: number; unverified: number; total: number };
  demandInboxOpen: number;
  budget: {
    providers: Awaited<ReturnType<BudgetGovernor['getSummary']>>;
    acquisitionMode: string;
    workerLastSeenAt: string | null;
    workerStale: boolean;
  };
  discovery: {
    windowDays: number;
    completed: number;
    failed: number;
    started: number;
    successRate: number | null;
    avgBusinessesPerCompletedRun: number | null;
  };
  /** Operator morning triage since last visit (or default window). */
  morningInbox: MorningInbox;
  kpis: OpsKpiRow[];
  revenue: RevenueOpsMetrics;
  /** Outcome learning: segment conversion + revenue attributed to plans (C9). */
  learning: LearningOpsMetrics;
};

function resolveMorningSince(since?: Date | string | null): Date {
  if (since) {
    const parsed = since instanceof Date ? since : new Date(since);
    if (Number.isFinite(parsed.getTime())) {
      const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
      const min = Date.now() - maxAgeMs;
      return new Date(Math.max(parsed.getTime(), min));
    }
  }
  // Default: yesterday 16:00 UTC ≈ “last evening” when no visit watermark.
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(16, 0, 0, 0);
  return d;
}

export class OpsMetricsService {
  private governor = new BudgetGovernor();

  async getMetrics(opts?: { since?: Date | string | null }): Promise<OpsMetrics> {
    await platformSettings.ensureLoaded();
    const db = getDb();
    const morningSince = resolveMorningSince(opts?.since ?? null);
    const minScore = platformSettings.getPlacesRunSettings().detailsMinScore ?? 25;

    const [funnelRows, reviewRow, demandOpen, discoveryRow, kpiRaw, revenue, morningRaw, learning] =
      await Promise.all([
      db.execute<{ status: string; count: string }>(sql`
        SELECT status, COUNT(*)::text AS count
        FROM leads
        GROUP BY status
      `),
      db.execute<{ verified: string; unverified: string }>(sql`
        WITH ranked AS (
          SELECT
            a.id AS account_id,
            (${prospectVerifiedSql}) AS verified,
            ROW_NUMBER() OVER (
              PARTITION BY a.id
              ORDER BY COALESCE(ls.score, 0) DESC NULLS LAST
            ) AS rn
          FROM businesses b
          INNER JOIN accounts a ON b.account_id = a.id
          LEFT JOIN lead_scores ls ON ls.business_id = b.id
          WHERE NOT EXISTS (SELECT 1 FROM leads l WHERE l.account_id = a.id)
            AND a.suppressed = false
            AND (a.review_snoozed_until IS NULL OR a.review_snoozed_until <= NOW())
        )
        SELECT
          COUNT(*) FILTER (WHERE verified)::text AS verified,
          COUNT(*) FILTER (WHERE NOT verified)::text AS unverified
        FROM ranked
        WHERE rn = 1
      `),
      db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM intent_signals
        WHERE signal_class = 'demand'
          AND business_id IS NULL
          AND dismissed_at IS NULL
      `),
      db.execute<{
        completed: string;
        failed: string;
        started: string;
        avg_businesses: string | null;
      }>(sql`
        WITH runs AS (
          SELECT id, status
          FROM discovery_runs
          WHERE created_at >= NOW() - INTERVAL '7 days'
            AND id != ${DEMAND_INGEST_RUN_ID}
        ),
        biz AS (
          SELECT b.discovery_run_id, COUNT(*)::int AS cnt
          FROM businesses b
          INNER JOIN runs r ON r.id = b.discovery_run_id
          WHERE r.status = 'completed'
          GROUP BY b.discovery_run_id
        )
        SELECT
          (SELECT COUNT(*)::text FROM runs WHERE status = 'completed') AS completed,
          (SELECT COUNT(*)::text FROM runs WHERE status = 'failed') AS failed,
          (SELECT COUNT(*)::text FROM runs) AS started,
          (SELECT ROUND(AVG(cnt)::numeric, 1)::text FROM biz) AS avg_businesses
      `),
      this.loadKpiValues(db),
      loadRevenueMetrics(db),
      this.loadMorningInbox(db, morningSince, minScore),
      loadLearningMetrics(db),
    ]);

    const funnel: Record<string, number> = {};
    for (const row of funnelRows) {
      funnel[row.status] = parseInt(row.count, 10);
    }

    const verified = parseInt(reviewRow[0]?.verified ?? '0', 10);
    const unverified = parseInt(reviewRow[0]?.unverified ?? '0', 10);

    const completed = parseInt(discoveryRow[0]?.completed ?? '0', 10);
    const failed = parseInt(discoveryRow[0]?.failed ?? '0', 10);
    const started = parseInt(discoveryRow[0]?.started ?? '0', 10);
    const finished = completed + failed;
    const avgRaw = discoveryRow[0]?.avg_businesses;

    const providers = await this.governor.getSummary();
    const heartbeat = await getWorkerHeartbeat();

    const kpis = OPERATING_KPI_TARGETS.map((kpi) => ({
      ...kpi,
      value: kpiRaw[kpi.id] ?? null,
    }));

    const reviewTotal = verified + unverified;
    const morningInbox = this.buildMorningInbox(morningSince, {
      ...morningRaw,
      reviewRequired: reviewTotal,
      demandOpen: parseInt(demandOpen[0]?.count ?? '0', 10),
    });

    return {
      generatedAt: new Date().toISOString(),
      funnel,
      reviewQueue: { verified, unverified, total: reviewTotal },
      demandInboxOpen: parseInt(demandOpen[0]?.count ?? '0', 10),
      budget: {
        providers,
        acquisitionMode: platformSettings.getAcquisitionMode(),
        workerLastSeenAt: heartbeat?.at ?? null,
        workerStale: isWorkerHeartbeatStale(heartbeat),
      },
      discovery: {
        windowDays: WINDOW_DAYS,
        completed,
        failed,
        started,
        successRate: formatPercent(completed, finished),
        avgBusinessesPerCompletedRun: avgRaw != null ? parseFloat(avgRaw) : null,
      },
      morningInbox,
      kpis,
      revenue,
      learning,
    };
  }

  private async loadMorningInbox(
    db: ReturnType<typeof getDb>,
    since: Date,
    minScore: number,
  ): Promise<{
    newQualified: number;
    plansCompleted: number;
    outreachReady: number;
    failedJobs: number;
  }> {
    const [qualifiedRow, plansRow, outreachRow, failedRow] = await Promise.all([
      db.execute<{ count: string }>(sql`
        SELECT COUNT(DISTINCT b.id)::text AS count
        FROM businesses b
        INNER JOIN lead_scores ls ON ls.business_id = b.id
        INNER JOIN accounts a ON a.id = b.account_id
        WHERE ls.score >= ${minScore}
          AND COALESCE(ls.computed_at, b.created_at) >= ${since}
          AND a.suppressed = false
          AND NOT EXISTS (SELECT 1 FROM leads l WHERE l.account_id = a.id)
      `),
      db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM discovery_runs
        WHERE plan_id IS NOT NULL
          AND status = 'completed'
          AND COALESCE(completed_at, created_at) >= ${since}
          AND id != ${DEMAND_INGEST_RUN_ID}
      `),
      db.execute<{ count: string }>(sql`
        WITH ranked AS (
          SELECT
            a.id AS account_id,
            COALESCE(ls.reachability, 'none') AS reachability,
            ROW_NUMBER() OVER (
              PARTITION BY a.id
              ORDER BY COALESCE(ls.score, 0) DESC NULLS LAST
            ) AS rn
          FROM businesses b
          INNER JOIN accounts a ON b.account_id = a.id
          LEFT JOIN lead_scores ls ON ls.business_id = b.id
          WHERE NOT EXISTS (SELECT 1 FROM leads l WHERE l.account_id = a.id)
            AND a.suppressed = false
            AND (a.review_snoozed_until IS NULL OR a.review_snoozed_until <= NOW())
            AND (
              NULLIF(TRIM(COALESCE(b.email, '')), '') IS NOT NULL
              OR NULLIF(TRIM(COALESCE(b.phone, '')), '') IS NOT NULL
            )
        )
        SELECT COUNT(*)::text AS count
        FROM ranked
        WHERE rn = 1
          AND reachability IN ('medium', 'high')
      `),
      db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM acquisition_jobs
        WHERE status = 'failed'
          AND updated_at >= ${since}
      `),
    ]);

    return {
      newQualified: parseInt(qualifiedRow[0]?.count ?? '0', 10),
      plansCompleted: parseInt(plansRow[0]?.count ?? '0', 10),
      outreachReady: parseInt(outreachRow[0]?.count ?? '0', 10),
      failedJobs: parseInt(failedRow[0]?.count ?? '0', 10),
    };
  }

  private buildMorningInbox(
    since: Date,
    counts: {
      newQualified: number;
      plansCompleted: number;
      reviewRequired: number;
      outreachReady: number;
      failedJobs: number;
      demandOpen: number;
    },
  ): MorningInbox {
    const items: MorningInboxItem[] = [
      {
        id: 'new_qualified',
        label: 'New qualified',
        count: counts.newQualified,
        hint: 'Scored prospects ready for Queue triage',
        href: '/review?acquisitionLane=greenfield',
      },
      {
        id: 'plans_completed',
        label: 'Plans completed',
        count: counts.plansCompleted,
        hint: 'Scheduled discovery runs finished overnight',
        href: '/discovery?hasPlan=1&status=completed',
      },
      {
        id: 'review_required',
        label: 'Review required',
        count: counts.reviewRequired,
        hint:
          counts.demandOpen > 0
            ? `${counts.demandOpen} open demand signal${counts.demandOpen === 1 ? '' : 's'} also waiting`
            : 'Opportunities waiting in the Queue',
        href: '/review?acquisitionLane=greenfield',
      },
      {
        id: 'outreach_ready',
        label: 'Outreach-ready',
        count: counts.outreachReady,
        hint: 'Contactable medium/high reachability in Queue',
        href: '/review?kind=opportunity&hasPhone=1&acquisitionLane=greenfield',
      },
      {
        id: 'failed_jobs',
        label: 'Failed jobs',
        count: counts.failedJobs,
        hint: 'Pipeline stages that need retry or attention',
        href: '/automation',
      },
    ];
    return { since: since.toISOString(), items };
  }

  private async loadKpiValues(db: ReturnType<typeof getDb>) {
    const [reachable, promoted, contacted, duplicate, demandActioned] = await Promise.all([
      db.execute<{ count: string }>(sql`
        SELECT COUNT(DISTINCT l.id)::text AS count
        FROM leads l
        INNER JOIN businesses b ON l.business_id = b.id
        LEFT JOIN lead_scores ls ON ls.business_id = b.id
        WHERE l.created_at >= NOW() - INTERVAL '7 days'
          AND l.status != 'NEW'
          AND COALESCE(ls.reachability, 'none') IN ('medium', 'high')
      `),
      db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM leads
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND status != 'NEW'
      `),
      db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM leads
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND status IN (
            'CONTACTED', 'REPLIED', 'QUALIFIED', 'PROPOSAL_SENT',
            'CLOSED_WON', 'CLOSED_LOST', 'NO_RESPONSE', 'NOT_INTERESTED'
          )
      `),
      db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM (
          SELECT l.account_id
          FROM outreach_messages om
          INNER JOIN leads l ON l.id = om.lead_id
          WHERE om.sent_at >= NOW() - INTERVAL '30 days'
          GROUP BY l.account_id
          HAVING COUNT(*) > 1
        ) dup
      `),
      db.execute<{ count: string }>(sql`
        SELECT (
          (SELECT COUNT(*) FROM intent_signals
           WHERE signal_class = 'demand'
             AND dismissed_at >= NOW() - INTERVAL '7 days')
          +
          (SELECT COUNT(*) FROM intent_signals isig
           INNER JOIN businesses b ON isig.business_id = b.id
           WHERE isig.signal_class = 'demand'
             AND b.source = 'demand_inbox'
             AND b.created_at >= NOW() - INTERVAL '7 days')
        )::text AS count
      `),
    ]);

    const promotedCount = parseInt(promoted[0]?.count ?? '0', 10);
    const contactedCount = parseInt(contacted[0]?.count ?? '0', 10);
    const dupCount = parseInt(duplicate[0]?.count ?? '0', 10);
    const totalOutreachAccounts = await db.execute<{ count: string }>(sql`
      SELECT COUNT(DISTINCT l.account_id)::text AS count
      FROM outreach_messages om
      INNER JOIN leads l ON l.id = om.lead_id
      WHERE om.sent_at >= NOW() - INTERVAL '30 days'
    `);
    const outreachAccounts = parseInt(totalOutreachAccounts[0]?.count ?? '0', 10);
    const duplicateRate = formatPercent(dupCount, outreachAccounts);

    const discoveryRow = await db.execute<{ completed: string; failed: string }>(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed')::text AS completed,
        COUNT(*) FILTER (WHERE status = 'failed')::text AS failed
      FROM discovery_runs
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND id != ${DEMAND_INGEST_RUN_ID}
    `);
    const discCompleted = parseInt(discoveryRow[0]?.completed ?? '0', 10);
    const discFailed = parseInt(discoveryRow[0]?.failed ?? '0', 10);
    const discoveryRate = formatPercent(discCompleted, discCompleted + discFailed);

    const places = (await this.governor.getSummary()).find((p) => p.provider === 'google_places');

    return {
      reachable_leads_week: parseInt(reachable[0]?.count ?? '0', 10),
      review_to_contacted: formatRateLabel(formatPercent(contactedCount, promotedCount)),
      duplicate_outreach: duplicateRate != null ? `${duplicateRate}%` : '—',
      places_spend_month: places ? `${places.used}/${places.cap}` : '—',
      discovery_success_rate: formatRateLabel(discoveryRate),
      demand_actioned_week: parseInt(demandActioned[0]?.count ?? '0', 10),
    } as Record<string, number | string | null>;
  }
}
