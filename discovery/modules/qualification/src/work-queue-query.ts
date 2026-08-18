import { getDb } from '@agency/database';
import {
  GREENFIELD_LANE_BONUS,
  DEMAND_PRIORITY_BASE,
  UNVERIFIED_OPPORTUNITY_BASE,
  VERIFIED_OPPORTUNITY_BASE,
} from './work-queue-priority';
import { prospectVerifiedSql } from './review-verification';
import { sql } from 'drizzle-orm';
import type { WorkQueueFilters } from './work-queue';

/** Link-in-bio hosts treated as non-real websites for SQL lane filtering. */
const LINK_IN_BIO_HOST_SQL = sql`(
  lower(regexp_replace(split_part(regexp_replace(COALESCE(b.website, ''), '^https?://', ''), '/', 1), '^www\\.', ''))
  ~ '(linktr\\.ee|linktree\\.com|bio\\.link|beacons\\.ai|carrd\\.co|stan\\.store|withkoji\\.com|solo\\.to|tap\\.bio|campsite\\.bio|heylink\\.me|allmylinks\\.com)$'
)`;

const REAL_WEBSITE_SQL = sql`(
  NULLIF(trim(COALESCE(b.website, '')), '') IS NOT NULL
  AND NOT ${LINK_IN_BIO_HOST_SQL}
)`;

const GREENFIELD_SQL = sql`(NOT ${REAL_WEBSITE_SQL})`;

export type WorkQueueCandidateRow = {
  kind: 'demand' | 'opportunity';
  id: string;
  priority: number;
  businessId: string | null;
  accountId: string | null;
  demandId: string | null;
};

function encodeCursor(row: Pick<WorkQueueCandidateRow, 'priority' | 'kind' | 'id'>): string {
  return Buffer.from(JSON.stringify({ p: row.priority, k: row.kind, i: row.id }), 'utf8').toString(
    'base64url',
  );
}

export function decodeWorkQueueCursor(
  cursor: string | undefined | null,
): { priority: number; kind: string; id: string } | null {
  if (!cursor?.trim()) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as {
      p?: unknown;
      k?: unknown;
      i?: unknown;
    };
    if (typeof parsed.p !== 'number' || typeof parsed.k !== 'string' || typeof parsed.i !== 'string') {
      return null;
    }
    return { priority: parsed.p, kind: parsed.k, id: parsed.i };
  } catch {
    return null;
  }
}

/**
 * Durable priority-ordered work-queue candidate page.
 * Opportunity priority mirrors work-queue-priority.ts using SQL approximations for
 * verified/score/reachability/greenfield lane. Enrichment happens only for the returned page.
 */
export async function queryWorkQueueCandidates(filters: WorkQueueFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;
  const kind = filters.kind ?? 'all';
  const acquisitionLane = filters.acquisitionLane ?? 'greenfield';
  const cursor = decodeWorkQueueCursor(filters.cursor);

  const oppConditions: ReturnType<typeof sql>[] = [
    sql`NOT EXISTS (SELECT 1 FROM leads l WHERE l.account_id = a.id)`,
    sql`a.suppressed = false`,
    sql`(a.review_snoozed_until IS NULL OR a.review_snoozed_until <= NOW())`,
  ];
  if (filters.runId) oppConditions.push(sql`b.discovery_run_id = ${filters.runId}`);
  if (filters.minScore != null) oppConditions.push(sql`COALESCE(ls.score, 0) >= ${filters.minScore}`);
  if (filters.reachability) oppConditions.push(sql`ls.reachability = ${filters.reachability}`);
  if (filters.verification === 'verified') oppConditions.push(prospectVerifiedSql);
  if (filters.verification === 'unverified') oppConditions.push(sql`NOT ${prospectVerifiedSql}`);
  if (acquisitionLane === 'greenfield') oppConditions.push(GREENFIELD_SQL);
  if (acquisitionLane === 'redesign') oppConditions.push(REAL_WEBSITE_SQL);
  if (filters.hasPhone) {
    oppConditions.push(sql`(
      NULLIF(trim(COALESCE(b.phone, '')), '') IS NOT NULL
      OR NULLIF(trim(COALESCE(a.phone, '')), '') IS NOT NULL
    )`);
  }

  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
    oppConditions.push(sql`(
      b.name ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(b.city, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(b.email, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(b.phone, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(a.email, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(dr.industry, '') ILIKE ${pattern} ESCAPE '\\'
    )`);
  }

  const demandConditions: ReturnType<typeof sql>[] = [
    sql`s.signal_class = 'demand'`,
    sql`s.business_id IS NULL`,
    sql`s.dismissed_at IS NULL`,
  ];
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
    demandConditions.push(sql`(
      COALESCE(s.title, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(s.snippet, '') ILIKE ${pattern} ESCAPE '\\'
      OR COALESCE(s.source, '') ILIKE ${pattern} ESCAPE '\\'
    )`);
  }

  const oppWhere = sql.join(oppConditions, sql` AND `);
  const demandWhere = sql.join(demandConditions, sql` AND `);

  const reachBonus = sql`
    CASE COALESCE(ls.reachability, 'none')
      WHEN 'high' THEN 30
      WHEN 'medium' THEN 20
      WHEN 'low' THEN 10
      ELSE 0
    END
  `;

  const oppPriority = sql`
    CASE WHEN (${prospectVerifiedSql}) THEN ${VERIFIED_OPPORTUNITY_BASE} ELSE ${UNVERIFIED_OPPORTUNITY_BASE} END
    + CASE WHEN (${GREENFIELD_SQL}) THEN ${GREENFIELD_LANE_BONUS} ELSE 0 END
    + LEAST(100, GREATEST(0, COALESCE(ls.score, 0)))
    + CASE WHEN (${prospectVerifiedSql}) THEN ${reachBonus} ELSE 0 END
  `;

  const demandPriority = sql`${DEMAND_PRIORITY_BASE} + LEAST(100, GREATEST(0, COALESCE(s.signal_strength, 0)))`;

  // Phone-ready triage is opportunity-only; demand rows have no WhatsApp channel yet.
  const includeDemand = kind !== 'opportunity' && !filters.hasPhone;
  const includeOpp = kind !== 'demand';

  const unionParts: ReturnType<typeof sql>[] = [];
  if (includeDemand) {
    unionParts.push(sql`
      SELECT
        'demand'::text AS kind,
        s.id::text AS id,
        (${demandPriority})::int AS priority,
        NULL::uuid AS business_id,
        NULL::uuid AS account_id,
        s.id AS demand_id
      FROM intent_signals s
      WHERE ${demandWhere}
    `);
  }
  if (includeOpp) {
    unionParts.push(sql`
      SELECT
        'opportunity'::text AS kind,
        a.id::text AS id,
        (${oppPriority})::int AS priority,
        b.id AS business_id,
        a.id AS account_id,
        NULL::uuid AS demand_id
      FROM businesses b
      INNER JOIN accounts a ON b.account_id = a.id
      INNER JOIN discovery_runs dr ON b.discovery_run_id = dr.id
      LEFT JOIN lead_scores ls ON ls.business_id = b.id
      WHERE ${oppWhere}
    `);
  }

  if (unionParts.length === 0) {
    return {
      rows: [] as WorkQueueCandidateRow[],
      total: 0,
      page,
      limit,
      nextCursor: null as string | null,
      hasMore: false,
    };
  }

  const unionSql = sql.join(unionParts, sql` UNION ALL `);
  const db = getDb();

  let keysetClause = sql`TRUE`;
  if (cursor) {
    keysetClause = sql`(
      priority < ${cursor.priority}
      OR (priority = ${cursor.priority} AND kind > ${cursor.kind})
      OR (priority = ${cursor.priority} AND kind = ${cursor.kind} AND id > ${cursor.id})
    )`;
  }

  const countResult = await db.execute<{ count: string }>(sql`
    SELECT COUNT(*)::text AS count FROM (${unionSql}) candidates
  `);
  const total = parseInt(countResult[0]?.count ?? '0', 10);

  const rows = (await db.execute<{
    kind: 'demand' | 'opportunity';
    id: string;
    priority: number;
    business_id: string | null;
    account_id: string | null;
    demand_id: string | null;
  }>(sql`
    SELECT * FROM (${unionSql}) candidates
    WHERE ${keysetClause}
    ORDER BY priority DESC, kind ASC, id ASC
    LIMIT ${limit}
    ${cursor ? sql`` : sql`OFFSET ${offset}`}
  `)) as unknown as Array<{
    kind: 'demand' | 'opportunity';
    id: string;
    priority: number;
    business_id: string | null;
    account_id: string | null;
    demand_id: string | null;
  }>;

  const mapped: WorkQueueCandidateRow[] = rows.map((row) => ({
    kind: row.kind,
    id: row.id,
    priority: Number(row.priority),
    businessId: row.business_id,
    accountId: row.account_id,
    demandId: row.demand_id,
  }));

  const last = mapped[mapped.length - 1];
  const nextCursor = last && mapped.length === limit ? encodeCursor(last) : null;

  return {
    rows: mapped,
    total,
    page,
    limit,
    nextCursor,
    hasMore: Boolean(nextCursor) || page * limit < total,
  };
}
