import { getDb } from '@agency/database';
import { sql } from 'drizzle-orm';
import { formatPercent } from './metrics-format';

export type SegmentConversionRow = {
  segmentKey: string;
  label: string;
  industry: string | null;
  city: string | null;
  presenceClass: string | null;
  won: number;
  lost: number;
  sampleSize: number;
  winRate: number | null;
  avgProjectValueUgx: number | null;
  adjustment: number;
};

export type RevenueByPlanRow = {
  planId: string | null;
  planName: string;
  won: number;
  lost: number;
  revenueUgx: number;
  winRate: number | null;
};

export type LearningOpsMetrics = {
  segments: SegmentConversionRow[];
  revenueByPlan: RevenueByPlanRow[];
};

export async function loadLearningMetrics(
  db: ReturnType<typeof getDb>,
): Promise<LearningOpsMetrics> {
  const [segmentRows, planRows] = await Promise.all([
    db.execute<{
      segment_key: string;
      label: string | null;
      industry: string | null;
      city: string | null;
      presence_class: string | null;
      won_count: string;
      lost_count: string;
      sample_size: string;
      win_rate: string;
      avg_project_value_ugx: string | null;
      adjustment: string;
    }>(sql`
      SELECT
        segment_key,
        label,
        industry,
        city,
        presence_class,
        won_count::text,
        lost_count::text,
        sample_size::text,
        win_rate::text,
        avg_project_value_ugx::text,
        adjustment::text
      FROM segment_performance
      WHERE sample_size > 0
      ORDER BY sample_size DESC, win_rate DESC
      LIMIT 12
    `),
    db.execute<{
      plan_id: string | null;
      plan_name: string;
      won: string;
      lost: string;
      revenue_ugx: string;
    }>(sql`
      SELECT
        dp.id::text AS plan_id,
        COALESCE(dp.name, 'Unattributed') AS plan_name,
        COUNT(*) FILTER (WHERE lo.outcome_status = 'closed_won')::text AS won,
        COUNT(*) FILTER (WHERE lo.outcome_status = 'closed_lost')::text AS lost,
        COALESCE(
          SUM(lo.project_value_ugx) FILTER (WHERE lo.outcome_status = 'closed_won'),
          0
        )::text AS revenue_ugx
      FROM lead_outcomes lo
      LEFT JOIN leads l ON l.id = lo.lead_id
      LEFT JOIN businesses b ON b.id = l.business_id
      LEFT JOIN discovery_runs dr ON dr.id = b.discovery_run_id
      LEFT JOIN discovery_plans dp ON dp.id = dr.plan_id
      WHERE lo.outcome_status IN ('closed_won', 'closed_lost')
      GROUP BY dp.id, dp.name
      ORDER BY SUM(lo.project_value_ugx) FILTER (WHERE lo.outcome_status = 'closed_won') DESC NULLS LAST,
               COUNT(*) FILTER (WHERE lo.outcome_status = 'closed_won') DESC
      LIMIT 10
    `),
  ]);

  return {
    segments: segmentRows.map((r) => {
      const won = parseInt(r.won_count, 10);
      const lost = parseInt(r.lost_count, 10);
      const sampleSize = parseInt(r.sample_size, 10);
      const avgRaw = r.avg_project_value_ugx;
      return {
        segmentKey: r.segment_key,
        label:
          r.label?.trim() ||
          [r.industry, r.city, r.presence_class].filter(Boolean).join(' · ') ||
          r.segment_key,
        industry: r.industry,
        city: r.city,
        presenceClass: r.presence_class,
        won,
        lost,
        sampleSize,
        winRate: formatPercent(won, won + lost),
        avgProjectValueUgx: avgRaw != null ? Math.round(parseFloat(avgRaw)) : null,
        adjustment: parseInt(r.adjustment, 10),
      };
    }),
    revenueByPlan: planRows.map((r) => {
      const won = parseInt(r.won, 10);
      const lost = parseInt(r.lost, 10);
      return {
        planId: r.plan_id,
        planName: r.plan_name,
        won,
        lost,
        revenueUgx: parseInt(r.revenue_ugx, 10),
        winRate: formatPercent(won, won + lost),
      };
    }),
  };
}
