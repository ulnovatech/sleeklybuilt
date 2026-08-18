import { BudgetGovernor } from '@agency/acquisition';
import { logger } from '@agency/config';
import { platformSettings } from '@agency/settings';
import {
  canRunAt,
  computeNextRunAt,
  computeSkipHoursNextRunAt,
} from './cadence';
import { DiscoveryPlanService } from './plan-service';
import type { PlanEventType } from './types';

const SOURCE_TO_BUDGET: Record<string, Array<'google_places' | 'google_cse' | 'bing_search' | 'meta_graph'>> = {
  google_maps: ['google_places'],
  public_search: ['google_cse', 'bing_search'],
  social_search: ['google_cse', 'bing_search'],
  facebook: ['meta_graph'],
  csv_import: [],
};

export type TickDiscoveryPlansResult = {
  claimed: number;
  scheduled: Array<{ planId: string; runId: string; targetId: string }>;
  skipped: Array<{ planId: string; reason: PlanEventType; message: string }>;
};

export type TickDiscoveryPlansDeps = {
  now?: Date;
  /** Max plans to claim per tick. */
  limit?: number;
  /** Enqueue acquisition pipeline for a new run. */
  enqueueRun: (runId: string) => Promise<unknown>;
  planService?: DiscoveryPlanService;
  budget?: BudgetGovernor;
};

/**
 * Scheduler tick: claim due plans, gate on hours/caps/budget, create runs, enqueue pipeline.
 */
export async function tickDiscoveryPlans(
  deps: TickDiscoveryPlansDeps,
): Promise<TickDiscoveryPlansResult> {
  const now = deps.now ?? new Date();
  const limit = deps.limit ?? 5;
  const plans = deps.planService ?? new DiscoveryPlanService();
  const budget = deps.budget ?? new BudgetGovernor();
  const repo = plans.repoPublic;

  const claimed = await repo.claimDuePlans(now, limit);
  const scheduled: TickDiscoveryPlansResult['scheduled'] = [];
  const skipped: TickDiscoveryPlansResult['skipped'] = [];

  for (const plan of claimed) {
    // Lease: keep another tick from reclaiming while we evaluate gates.
    await repo.updatePlan(plan.id, { nextRunAt: new Date(now.getTime() + 5 * 60_000) });

    const cadence = plans.parseCadence(plan);
    const limits = plans.parseLimits(plan);

    const skip = async (reason: PlanEventType, message: string, nextRunAt: Date | null) => {
      await repo.updatePlan(plan.id, { nextRunAt });
      await repo.addEvent({ planId: plan.id, type: reason, message });
      skipped.push({ planId: plan.id, reason, message });
    };

    if (!canRunAt(now, cadence)) {
      await skip(
        'skipped_hours',
        'Outside active hours or days-of-week window',
        computeSkipHoursNextRunAt(now, cadence),
      );
      continue;
    }

    const concurrent = await repo.countConcurrentRuns(plan.id);
    if (concurrent >= limits.maxConcurrentRuns) {
      await skip(
        'skipped_cap',
        `Concurrent runs at cap (${concurrent}/${limits.maxConcurrentRuns})`,
        computeNextRunAt(now, cadence),
      );
      continue;
    }

    const runsToday = await repo.countRunsToday(plan.id, plans.dayStart(now));
    if (runsToday >= limits.maxRunsPerDay) {
      // Next try tomorrow UTC midnight + cadence offset
      const tomorrow = new Date(plans.dayStart(now).getTime() + 24 * 3600_000);
      await skip(
        'skipped_cap',
        `Daily run cap reached (${runsToday}/${limits.maxRunsPerDay})`,
        tomorrow,
      );
      continue;
    }

    // Monitor re-checks known accounts — no Places/CSE discover spend.
    if (plan.planType !== 'monitor') {
      await platformSettings.ensureLoaded();
      const sources = Array.isArray(plan.sources) ? plan.sources : [];
      if (sources.includes('google_maps') && !platformSettings.isPlacesConfigured()) {
        await skip(
          'skipped_credentials',
          'Google Places API key missing — required for factory harvest. Add it in Settings → API credentials.',
          computeNextRunAt(now, cadence),
        );
        continue;
      }
      const budgetBlocked: string[] = [];
      for (const source of sources) {
        const providers = SOURCE_TO_BUDGET[String(source)] ?? [];
        if (providers.length === 0) continue;
        // Require at least one provider for the source family to have remaining budget
        const remainings = await Promise.all(providers.map((p) => budget.getRemaining(p)));
        if (remainings.every((r) => r <= 0)) {
          budgetBlocked.push(String(source));
        }
      }
      if (
        budgetBlocked.length > 0 &&
        budgetBlocked.length ===
          sources.filter((s) => (SOURCE_TO_BUDGET[String(s)] ?? []).length > 0).length
      ) {
        await skip(
          'skipped_budget',
          `Budget exhausted for sources: ${budgetBlocked.join(', ')}`,
          computeNextRunAt(now, cadence),
        );
        continue;
      }
    }

    const target = await repo.pickNextTarget(plan.id, now);
    if (!target) {
      await skip(
        'skipped_no_target',
        'No eligible targets (all suppressed or empty matrix)',
        computeNextRunAt(now, cadence),
      );
      continue;
    }

    try {
      const { run } = await plans.createRunForPlan({
        planId: plan.id,
        targetId: target.id,
        trigger: 'plan',
        now,
      });
      await deps.enqueueRun(run.id);
      const nextRunAt = computeNextRunAt(now, cadence);
      await repo.updatePlan(plan.id, { nextRunAt });
      await repo.addEvent({
        planId: plan.id,
        type: 'scheduled',
        message: `Scheduled ${target.city}, ${target.country} · ${target.industry}`,
        runId: run.id,
      });
      scheduled.push({ planId: plan.id, runId: run.id, targetId: target.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Discovery plan tick failed to create run', { planId: plan.id, error: message });
      await repo.updatePlan(plan.id, {
        nextRunAt: computeNextRunAt(now, cadence),
        consecutiveFailures: (plan.consecutiveFailures ?? 0) + 1,
      });
      await repo.addEvent({ planId: plan.id, type: 'failed', message });
      skipped.push({ planId: plan.id, reason: 'failed', message });
    }
  }

  return { claimed: claimed.length, scheduled, skipped };
}
