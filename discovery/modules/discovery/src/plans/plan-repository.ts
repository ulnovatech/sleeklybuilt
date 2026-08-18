import {
  getDb,
  discoveryPlans,
  discoveryPlanTargets,
  discoveryPlanEvents,
  discoveryRuns,
} from '@agency/database';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { PlanEventType, PlanSegment } from './types';
import { isExploreFloorSlot } from './explore-floor';
import { FACTORY_CORE_TEMPLATE_KEY, FACTORY_EXPLORE_TEMPLATE_KEY } from './factory-markets';

export class DiscoveryPlanRepository {
  async createPlan(values: typeof discoveryPlans.$inferInsert) {
    const db = getDb();
    const [row] = await db.insert(discoveryPlans).values(values).returning();
    return row;
  }

  async updatePlan(id: string, values: Partial<typeof discoveryPlans.$inferInsert>) {
    const db = getDb();
    const [row] = await db
      .update(discoveryPlans)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(discoveryPlans.id, id))
      .returning();
    return row ?? null;
  }

  async getPlan(id: string) {
    const db = getDb();
    const [row] = await db.select().from(discoveryPlans).where(eq(discoveryPlans.id, id)).limit(1);
    return row ?? null;
  }

  async getPlanByTemplateKey(templateKey: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(discoveryPlans)
      .where(eq(discoveryPlans.templateKey, templateKey))
      .limit(1);
    return row ?? null;
  }

  async listPlans(input: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    planType?: string;
    sort?: 'updatedAt' | 'nextRunAt' | 'name' | 'priority' | 'createdAt';
    direction?: 'asc' | 'desc';
  } = {}) {
    const db = getDb();
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 20));
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];
    if (input.status) conditions.push(eq(discoveryPlans.status, input.status));
    if (input.planType) conditions.push(eq(discoveryPlans.planType, input.planType));
    const q = input.q?.trim();
    if (q) {
      const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
      const match = or(ilike(discoveryPlans.name, pattern), ilike(discoveryPlans.description, pattern));
      if (match) conditions.push(match);
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const dir = input.direction === 'asc' ? asc : desc;
    const orderBy =
      input.sort === 'nextRunAt'
        ? [dir(discoveryPlans.nextRunAt), desc(discoveryPlans.updatedAt)]
        : input.sort === 'name'
          ? [dir(discoveryPlans.name)]
          : input.sort === 'priority'
            ? [dir(discoveryPlans.priority), desc(discoveryPlans.updatedAt)]
            : input.sort === 'createdAt'
              ? [dir(discoveryPlans.createdAt)]
              : [dir(discoveryPlans.updatedAt)];

    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(discoveryPlans)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(discoveryPlans).where(where),
    ]);

    return {
      items,
      total: Number(totalRow[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async replaceTargets(planId: string, segments: PlanSegment[]) {
    const db = getDb();
    await db.delete(discoveryPlanTargets).where(eq(discoveryPlanTargets.planId, planId));
    if (segments.length === 0) return [];
    return db
      .insert(discoveryPlanTargets)
      .values(
        segments.map((s) => ({
          planId,
          country: s.country,
          city: s.city,
          industry: s.industry,
        })),
      )
      .returning();
  }

  async listTargets(planId: string) {
    const db = getDb();
    return db
      .select()
      .from(discoveryPlanTargets)
      .where(eq(discoveryPlanTargets.planId, planId))
      .orderBy(desc(discoveryPlanTargets.yieldScore), asc(discoveryPlanTargets.lastRunAt));
  }

  async listFactoryYieldTargets(limit = 5) {
    const db = getDb();
    return db
      .select({
        id: discoveryPlanTargets.id,
        planId: discoveryPlanTargets.planId,
        country: discoveryPlanTargets.country,
        city: discoveryPlanTargets.city,
        industry: discoveryPlanTargets.industry,
        yieldScore: discoveryPlanTargets.yieldScore,
        lastYield: discoveryPlanTargets.lastYield,
        wonCount: discoveryPlanTargets.wonCount,
        lostCount: discoveryPlanTargets.lostCount,
        suppressedUntil: discoveryPlanTargets.suppressedUntil,
        templateKey: discoveryPlans.templateKey,
        planName: discoveryPlans.name,
      })
      .from(discoveryPlanTargets)
      .innerJoin(discoveryPlans, eq(discoveryPlans.id, discoveryPlanTargets.planId))
      .where(inArray(discoveryPlans.templateKey, [FACTORY_CORE_TEMPLATE_KEY, FACTORY_EXPLORE_TEMPLATE_KEY]))
      .orderBy(desc(discoveryPlanTargets.yieldScore), desc(discoveryPlanTargets.wonCount))
      .limit(Math.min(20, Math.max(1, limit)));
  }

  async getTarget(id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(discoveryPlanTargets)
      .where(eq(discoveryPlanTargets.id, id))
      .limit(1);
    return row ?? null;
  }

  async markTargetRan(targetId: string, runId: string, at: Date) {
    const db = getDb();
    const [row] = await db
      .update(discoveryPlanTargets)
      .set({
        lastRunAt: at,
        lastRunId: runId,
        runCount: sql`${discoveryPlanTargets.runCount} + 1`,
      })
      .where(eq(discoveryPlanTargets.id, targetId))
      .returning();
    return row ?? null;
  }

  async updateTargetYield(
    targetId: string,
    lastYield: Record<string, unknown>,
    yieldScore?: number,
  ) {
    const db = getDb();
    const [row] = await db
      .update(discoveryPlanTargets)
      .set({
        lastYield,
        ...(yieldScore != null ? { yieldScore } : {}),
      })
      .where(eq(discoveryPlanTargets.id, targetId))
      .returning();
    return row ?? null;
  }

  async suppressTarget(targetId: string, until: Date, reason?: string) {
    const db = getDb();
    const [row] = await db
      .update(discoveryPlanTargets)
      .set({ suppressedUntil: until })
      .where(eq(discoveryPlanTargets.id, targetId))
      .returning();
    if (row && reason) {
      await this.addEvent({
        planId: row.planId,
        type: 'target_suppressed',
        message: `Target ${row.city}/${row.industry} suppressed until ${until.toISOString()}: ${reason}`,
      });
    }
    return row ?? null;
  }

  async clearTargetSuppression(targetId: string) {
    const db = getDb();
    const [row] = await db
      .update(discoveryPlanTargets)
      .set({ suppressedUntil: null })
      .where(eq(discoveryPlanTargets.id, targetId))
      .returning();
    return row ?? null;
  }

  async addEvent(input: {
    planId: string;
    type: PlanEventType;
    message?: string;
    runId?: string | null;
  }) {
    const db = getDb();
    const [row] = await db
      .insert(discoveryPlanEvents)
      .values({
        planId: input.planId,
        type: input.type,
        message: input.message ?? null,
        runId: input.runId ?? null,
      })
      .returning();
    return row;
  }

  async listEvents(planId: string, limit = 50) {
    const db = getDb();
    return db
      .select()
      .from(discoveryPlanEvents)
      .where(eq(discoveryPlanEvents.planId, planId))
      .orderBy(desc(discoveryPlanEvents.createdAt))
      .limit(limit);
  }

  /**
   * Claim due active plans with row locks. Returns locked plan rows.
   */
  async claimDuePlans(now: Date, limit = 5) {
    const db = getDb();
    return db.transaction(async (tx) => {
      const result = await tx.execute(sql`
        SELECT id
        FROM discovery_plans
        WHERE status = 'active'
          AND next_run_at IS NOT NULL
          AND next_run_at <= ${now}
        ORDER BY priority DESC, next_run_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      `);

      const ids: string[] = [];
      const asArray = result as unknown as Array<{ id?: string }> | { rows?: Array<{ id?: string }> };
      const list = Array.isArray(asArray) ? asArray : (asArray.rows ?? []);
      for (const row of list) {
        if (row?.id) ids.push(String(row.id));
      }
      if (ids.length === 0) return [];

      return tx.select().from(discoveryPlans).where(inArray(discoveryPlans.id, ids));
    });
  }

  async pickNextTarget(planId: string, now: Date) {
    const db = getDb();
    const runCount = await this.countPlanRuns(planId);
    const explore = isExploreFloorSlot(runCount);
    const eligible = and(
      eq(discoveryPlanTargets.planId, planId),
      or(isNull(discoveryPlanTargets.suppressedUntil), lte(discoveryPlanTargets.suppressedUntil, now)),
    );
    const ordered = explore
      ? db
          .select()
          .from(discoveryPlanTargets)
          .where(eligible)
          .orderBy(
            sql`${discoveryPlanTargets.lastRunAt} ASC NULLS FIRST`,
            asc(discoveryPlanTargets.yieldScore),
          )
      : db
          .select()
          .from(discoveryPlanTargets)
          .where(eligible)
          .orderBy(
            desc(discoveryPlanTargets.yieldScore),
            sql`${discoveryPlanTargets.lastRunAt} ASC NULLS FIRST`,
          );
    const [row] = await ordered.limit(1);
    return row ?? null;
  }

  async countPlanRuns(planId: string) {
    const db = getDb();
    const [row] = await db
      .select({ value: count() })
      .from(discoveryRuns)
      .where(eq(discoveryRuns.planId, planId));
    return Number(row?.value ?? 0);
  }
  async countRunsToday(planId: string, dayStart: Date) {
    const db = getDb();
    const [row] = await db
      .select({ value: count() })
      .from(discoveryRuns)
      .where(and(eq(discoveryRuns.planId, planId), gte(discoveryRuns.createdAt, dayStart)));
    return Number(row?.value ?? 0);
  }

  async countConcurrentRuns(planId: string) {
    const db = getDb();
    const [row] = await db
      .select({ value: count() })
      .from(discoveryRuns)
      .where(
        and(
          eq(discoveryRuns.planId, planId),
          inArray(discoveryRuns.status, ['pending', 'running']),
        ),
      );
    return Number(row?.value ?? 0);
  }
}
