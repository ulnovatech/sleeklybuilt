import { isTestFixtureCountry } from '@agency/database';
import {
  discoveryPlanCadenceSchema,
  discoveryPlanFiltersSchema,
  discoveryPlanLimitsSchema,
  discoveryPlanTargetsSchema,
  type CreateDiscoveryPlanInput,
  type UpdateDiscoveryPlanInput,
} from '@agency/validation';
import { DiscoveryService } from '../service';
import { expandPlanTargets } from './expand-targets';
import { computeNextRunAt } from './cadence';
import { DiscoveryPlanRepository } from './plan-repository';
import type { PlanCadence, PlanFiltersConfig, PlanLimitsConfig, PlanTargetsConfig } from './types';

function asCadence(raw: unknown): PlanCadence {
  const parsed = discoveryPlanCadenceSchema.safeParse(raw ?? { everyHours: 24 });
  return parsed.success ? parsed.data : { everyHours: 24 };
}

function asTargets(raw: unknown): PlanTargetsConfig {
  const parsed = discoveryPlanTargetsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid plan targets: ${parsed.error.message}`);
  }
  return parsed.data;
}

function asLimits(raw: unknown): PlanLimitsConfig {
  const parsed = discoveryPlanLimitsSchema.safeParse(raw ?? {});
  return parsed.success
    ? parsed.data
    : { maxRunsPerDay: 8, maxConcurrentRuns: 1 };
}

function asFilters(raw: unknown): PlanFiltersConfig {
  const parsed = discoveryPlanFiltersSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : { presence: 'greenfield' };
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export class DiscoveryPlanService {
  private repo = new DiscoveryPlanRepository();
  private discovery = new DiscoveryService();

  async createPlan(input: CreateDiscoveryPlanInput, createdBy?: string) {
    for (const country of input.targets.countries) {
      if (isTestFixtureCountry(country)) {
        throw new Error(`Invalid discovery target — test fixture country: ${country}`);
      }
    }

    const cadence = asCadence(input.cadence);
    const limits = asLimits(input.limits);
    const filters = asFilters(input.filters);
    const now = new Date();
    const nextRunAt =
      input.status === 'active' && input.scheduleImmediately !== false
        ? now
        : input.status === 'active'
          ? computeNextRunAt(now, cadence)
          : null;

    const plan = await this.repo.createPlan({
      name: input.name,
      description: input.description ?? null,
      planType: input.planType,
      status: input.status,
      sources: input.sources,
      targets: input.targets,
      filters,
      runProfile: input.runProfile,
      prospectFocus: input.prospectFocus,
      boiNarrative: input.boiNarrative,
      campaignKey: input.campaignKey ?? null,
      templateKey: input.templateKey ?? null,
      cadence,
      limits,
      priority: input.priority,
      nextRunAt,
      createdBy: createdBy ?? null,
    });

    const segments = expandPlanTargets(asTargets(input.targets));
    if (segments.length === 0) {
      throw new Error('Plan must expand to at least one country × city × industry target');
    }
    const targets = await this.repo.replaceTargets(plan.id, segments);

    await this.repo.addEvent({
      planId: plan.id,
      type: 'scheduled',
      message: `Plan created with ${targets.length} target(s); next run ${nextRunAt?.toISOString() ?? 'unscheduled'}`,
    });

    return { plan, targets };
  }

  async updatePlan(id: string, input: UpdateDiscoveryPlanInput) {
    const existing = await this.repo.getPlan(id);
    if (!existing) throw new Error('Discovery plan not found');

    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.planType !== undefined) patch.planType = input.planType;
    if (input.status !== undefined) patch.status = input.status;
    if (input.sources !== undefined) patch.sources = input.sources;
    if (input.filters !== undefined) patch.filters = asFilters(input.filters);
    if (input.runProfile !== undefined) patch.runProfile = input.runProfile;
    if (input.prospectFocus !== undefined) patch.prospectFocus = input.prospectFocus;
    if (input.boiNarrative !== undefined) patch.boiNarrative = input.boiNarrative;
    if (input.campaignKey !== undefined) patch.campaignKey = input.campaignKey;
    if (input.templateKey !== undefined) patch.templateKey = input.templateKey;
    if (input.cadence !== undefined) patch.cadence = asCadence(input.cadence);
    if (input.limits !== undefined) patch.limits = asLimits(input.limits);
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.pausedReason !== undefined) patch.pausedReason = input.pausedReason;

    if (input.targets) {
      patch.targets = input.targets;
      await this.repo.replaceTargets(id, expandPlanTargets(asTargets(input.targets)));
    }

    if (input.status === 'active' && existing.status !== 'active') {
      const cadence = asCadence(input.cadence ?? existing.cadence);
      patch.nextRunAt = new Date();
      patch.pausedReason = null;
      await this.repo.addEvent({ planId: id, type: 'resumed', message: 'Plan resumed' });
    }
    if (input.status === 'paused' && existing.status === 'active') {
      patch.nextRunAt = null;
      await this.repo.addEvent({
        planId: id,
        type: 'paused',
        message: input.pausedReason ?? 'Plan paused',
      });
    }
    if (input.status === 'archived') {
      patch.nextRunAt = null;
    }

    const plan = await this.repo.updatePlan(id, patch as Parameters<DiscoveryPlanRepository['updatePlan']>[1]);
    return plan;
  }

  async getPlan(id: string) {
    const plan = await this.repo.getPlan(id);
    if (!plan) return null;
    const [targets, events, recentRuns] = await Promise.all([
      this.repo.listTargets(id),
      this.repo.listEvents(id, 40),
      this.discovery.listRunsPaged({ planId: id, limit: 20, sort: 'createdAt', direction: 'desc' }),
    ]);
    return { plan, targets, events, recentRuns: recentRuns.items };
  }

  async listPlans(
    input: Parameters<DiscoveryPlanRepository['listPlans']>[0] = {},
  ) {
    return this.repo.listPlans(input);
  }

  async pause(id: string, reason?: string) {
    return this.updatePlan(id, { status: 'paused', pausedReason: reason ?? 'Paused by operator' });
  }

  async resume(id: string) {
    return this.updatePlan(id, { status: 'active', pausedReason: null });
  }

  /**
   * Create a discovery run for a specific target (or next eligible) and return the run id.
   * Caller is responsible for enqueueRunPipeline.
   */
  async createRunForPlan(opts: {
    planId: string;
    targetId?: string;
    trigger: 'plan' | 'cron' | 'manual';
    now?: Date;
  }) {
    const plan = await this.repo.getPlan(opts.planId);
    if (!plan) throw new Error('Discovery plan not found');

    const now = opts.now ?? new Date();
    const target = opts.targetId
      ? await this.repo.getTarget(opts.targetId)
      : await this.repo.pickNextTarget(plan.id, now);

    if (!target || target.planId !== plan.id) {
      throw new Error('No eligible plan target available');
    }

    const isMonitor = plan.planType === 'monitor';
    const run = await this.discovery.prepareRun({
      country: target.country,
      city: target.city,
      industry: target.industry,
      profile: (plan.runProfile as 'micro' | 'standard' | 'boost') ?? 'standard',
      prospectFocus: plan.prospectFocus,
      boiNarrative: isMonitor ? false : plan.boiNarrative,
      planId: plan.id,
      planTargetId: target.id,
      trigger: opts.trigger,
      allowWithoutProviders: isMonitor,
    });

    if (isMonitor) {
      await this.discovery.seedMonitorRun(run.id);
    }

    await this.repo.markTargetRan(target.id, run.id, now);
    await this.repo.updatePlan(plan.id, {
      lastRunAt: now,
      consecutiveFailures: 0,
    });

    return { plan, target, run };
  }

  async runNow(planId: string, targetId?: string) {
    const result = await this.createRunForPlan({
      planId,
      targetId,
      trigger: 'manual',
    });
    const cadence = asCadence(result.plan.cadence);
    const nextRunAt =
      result.plan.status === 'active' ? computeNextRunAt(new Date(), cadence) : result.plan.nextRunAt;
    await this.repo.updatePlan(planId, { nextRunAt: nextRunAt ?? null });
    await this.repo.addEvent({
      planId,
      type: 'run_now',
      message: `Manual run for ${result.target.city}, ${result.target.country} · ${result.target.industry}`,
      runId: result.run.id,
    });
    return result;
  }

  /** Exposed for scheduler gating tests and tick. */
  parseLimits(plan: { limits: unknown }) {
    return asLimits(plan.limits);
  }

  parseCadence(plan: { cadence: unknown }) {
    return asCadence(plan.cadence);
  }

  dayStart(now: Date) {
    return startOfUtcDay(now);
  }

  get repoPublic() {
    return this.repo;
  }
}
