import { getDb } from '@agency/database';
import { sql } from 'drizzle-orm';
import type { MinReachabilityLevel, Reachability } from '@agency/scoring';
import { reachabilityLevelsAtOrAbove } from '@agency/scoring';
import { prospectVerifiedSql, type VerificationFilter } from './review-verification';

export type ReviewQueueFilters = {
  runId?: string;
  minScore?: number;
  reachability?: Reachability;
  minReachability?: MinReachabilityLevel;
  verification?: VerificationFilter;
  /** Server-side text search across business/account identity fields. */
  q?: string;
  /** Optional explicit account allow-list (work-queue page hydration). */
  accountIds?: string[];
  page?: number;
  limit?: number;
};

export type ReviewQueueRow = {
  businessId: string;
  businessName: string;
  businessWebsite: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessCity: string | null;
  businessCountry: string | null;
  accountId: string;
  accountEmail: string | null;
  accountPhone: string | null;
  runId: string;
  runIndustry: string;
  runCity: string;
  score: number;
  reachability: string | null;
  factors: Record<string, number>;
  verified: boolean;
  listSuppressed: boolean;
};

export async function queryReviewQueue(filters: ReviewQueueFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof sql>[] = [
    sql`NOT EXISTS (SELECT 1 FROM leads l WHERE l.account_id = a.id)`,
    sql`a.suppressed = false`,
    sql`(a.review_snoozed_until IS NULL OR a.review_snoozed_until <= NOW())`,
  ];

  if (filters.runId) {
    conditions.push(sql`b.discovery_run_id = ${filters.runId}`);
  }
  if (filters.minScore != null) {
    conditions.push(sql`COALESCE(ls.score, 0) >= ${filters.minScore}`);
  }
  if (filters.reachability) {
    conditions.push(sql`ls.reachability = ${filters.reachability}`);
  } else if (filters.minReachability) {
    const levels = reachabilityLevelsAtOrAbove(filters.minReachability);
    conditions.push(
      sql`ls.reachability IN (${sql.join(
        levels.map((level) => sql`${level}`),
        sql`, `,
      )})`,
    );
  }
  if (filters.verification === 'verified') {
    conditions.push(prospectVerifiedSql);
  } else if (filters.verification === 'unverified') {
    conditions.push(sql`NOT ${prospectVerifiedSql}`);
  }
  if (filters.accountIds?.length) {
    conditions.push(
      sql`a.id IN (${sql.join(
        filters.accountIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );
  }

  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
    conditions.push(sql`(
      b.name ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(b.city, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(b.email, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(b.phone, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(a.email, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(a.phone, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(dr.industry, '') ILIKE ${pattern} ESCAPE '\\'
    )`);
  }

  const whereClause = sql.join(conditions, sql` AND `);

  const db = getDb();

  const countResult = await db.execute<{ count: string }>(sql`
    WITH ranked AS (
      SELECT
        a.id AS account_id,
        COALESCE(ls.score, 0) AS score,
        ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY COALESCE(ls.score, 0) DESC NULLS LAST) AS rn
      FROM businesses b
      INNER JOIN accounts a ON b.account_id = a.id
      INNER JOIN discovery_runs dr ON b.discovery_run_id = dr.id
      LEFT JOIN lead_scores ls ON ls.business_id = b.id
      WHERE ${whereClause}
    )
    SELECT COUNT(*)::text AS count FROM ranked WHERE rn = 1
  `);

  const total = parseInt(countResult[0]?.count ?? '0', 10);

  const rows = await db.execute<ReviewQueueRow>(sql`
    WITH ranked AS (
      SELECT
        b.id AS business_id,
        b.name AS business_name,
        b.website AS business_website,
        b.email AS business_email,
        b.phone AS business_phone,
        b.city AS business_city,
        b.country AS business_country,
        a.id AS account_id,
        a.email AS account_email,
        a.phone AS account_phone,
        dr.id AS run_id,
        dr.industry AS run_industry,
        dr.city AS run_city,
        COALESCE(ls.score, 0) AS score,
        ls.reachability AS reachability,
        COALESCE(ls.factors, '{}'::jsonb) AS factors,
        (${prospectVerifiedSql}) AS verified,
        EXISTS (
          SELECT 1 FROM suppression_list sl
          WHERE
            (a.email IS NOT NULL AND sl.email IS NOT NULL AND lower(sl.email) = lower(a.email))
            OR (
              a.phone IS NOT NULL AND sl.phone IS NOT NULL
              AND regexp_replace(sl.phone, '[^0-9]', '', 'g') = regexp_replace(a.phone, '[^0-9]', '', 'g')
              AND length(regexp_replace(a.phone, '[^0-9]', '', 'g')) >= 7
            )
            OR (
              a.website IS NOT NULL AND sl.domain IS NOT NULL
              AND lower(sl.domain) = lower(
                regexp_replace(
                  split_part(regexp_replace(a.website, '^https?://', ''), '/', 1),
                  '^www\\.',
                  ''
                )
              )
            )
            OR (
              a.email IS NOT NULL AND sl.domain IS NOT NULL
              AND lower(sl.domain) = lower(split_part(a.email, '@', 2))
            )
        ) AS list_suppressed,
        ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY COALESCE(ls.score, 0) DESC NULLS LAST) AS rn
      FROM businesses b
      INNER JOIN accounts a ON b.account_id = a.id
      INNER JOIN discovery_runs dr ON b.discovery_run_id = dr.id
      LEFT JOIN lead_scores ls ON ls.business_id = b.id
      WHERE ${whereClause}
    )
    SELECT
      business_id AS "businessId",
      business_name AS "businessName",
      business_website AS "businessWebsite",
      business_email AS "businessEmail",
      business_phone AS "businessPhone",
      business_city AS "businessCity",
      business_country AS "businessCountry",
      account_id AS "accountId",
      account_email AS "accountEmail",
      account_phone AS "accountPhone",
      run_id AS "runId",
      run_industry AS "runIndustry",
      run_city AS "runCity",
      score,
      reachability,
      factors,
      verified,
      list_suppressed AS "listSuppressed"
    FROM ranked
    WHERE rn = 1
    ORDER BY score DESC NULLS LAST
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  return { rows: rows as unknown as ReviewQueueRow[], total, page, limit };
}
