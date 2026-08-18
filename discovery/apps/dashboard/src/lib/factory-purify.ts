import { AccountService } from '@agency/accounts';
import { logger, mapWithConcurrency } from '@agency/config';
import { CrmService } from '@agency/crm';
import {
  calendarDateInTimezone,
  FACTORY_TIMEZONE,
  FactoryCohortRepository,
  FactoryPurifyService,
  purifyTargetDates,
} from '@agency/discovery';
import {
  buildCaseFile,
  IntelligenceService,
  normalizeBusinessIntelligenceProfile,
} from '@agency/intelligence';
import { QualificationService } from '@agency/qualification';

const crm = new CrmService();
const intelligence = new IntelligenceService();
const qualification = new QualificationService();
const accounts = new AccountService();

export type FactoryPurifyTickResult = {
  skipped: boolean;
  reason?: 'outside_window' | 'already_frozen' | 'empty_harvest' | 'error';
  sellDate: string;
  harvestDate: string;
  keeperCount?: number;
  dumpsterCount?: number;
  promoted?: number;
  prewarmed?: number;
  errorMessage?: string;
};

export async function runFactoryPurifyTick(opts?: {
  now?: Date;
  force?: boolean;
  ignoreWindow?: boolean;
}): Promise<FactoryPurifyTickResult> {
  const now = opts?.now ?? new Date();
  const target = purifyTargetDates(now);
  const repo = new FactoryCohortRepository();
  const existing = await repo.getBySellDate(target.sellDate);
  const shouldPurify = Boolean(
    opts?.ignoreWindow ||
      opts?.force ||
      target.inWindow ||
      existing?.status === 'failed' ||
      existing?.status === 'purifying',
  );

  let skipped = !shouldPurify;
  let reason: FactoryPurifyTickResult['reason'] = shouldPurify ? undefined : 'outside_window';
  let keeperCount: number | undefined;
  let dumpsterCount: number | undefined;
  let errorMessage: string | undefined;
  let harvestDate = target.harvestDate;
  let sellDate = target.sellDate;

  if (shouldPurify) {
    const result = await new FactoryPurifyService(repo).purify({
      harvestDate: target.harvestDate,
      sellDate: target.sellDate,
      force: opts?.force,
    });
    skipped = result.skipped;
    reason = result.reason;
    keeperCount = result.keeperCount;
    dumpsterCount = result.dumpsterCount;
    errorMessage = result.errorMessage;
    harvestDate = result.cohort.harvestDate;
    sellDate = result.cohort.sellDate;
    if (result.reason === 'error' || result.reason === 'empty_harvest') {
      logger.error('Factory purify failed closed', {
        sellDate,
        harvestDate,
        error: errorMessage,
        fallbackCohortId: result.cohort.fallbackCohortId,
      });
    } else if (!result.skipped) {
      logger.info('Factory cohort frozen', {
        sellDate,
        harvestDate,
        keepers: keeperCount,
        dumpster: dumpsterCount,
      });
    }
  }

  const todaySell = calendarDateInTimezone(now, FACTORY_TIMEZONE);
  let promoted = 0;
  let prewarmed = 0;
  for (const date of new Set([todaySell, sellDate])) {
    const cohort = await repo.getBySellDate(date);
    if (cohort?.status !== 'frozen') continue;
    const stats = await promoteAndPrewarmKeepers(repo, cohort.id);
    promoted += stats.promoted;
    prewarmed += stats.prewarmed;
  }

  return {
    skipped,
    reason,
    sellDate,
    harvestDate,
    keeperCount,
    dumpsterCount,
    promoted,
    prewarmed,
    errorMessage,
  };
}

/** Promote frozen keepers to Pipeline leads and pre-warm case files for a sell date. */
export async function ensureFrozenKeepersReady(sellDate?: string) {
  const date = sellDate ?? calendarDateInTimezone(new Date(), FACTORY_TIMEZONE);
  const repo = new FactoryCohortRepository();
  const cohort = await repo.getBySellDate(date);
  if (cohort?.status !== 'frozen') {
    return { promoted: 0, prewarmed: 0, sellDate: date, status: cohort?.status ?? 'missing' };
  }
  const stats = await promoteAndPrewarmKeepers(repo, cohort.id);
  return { ...stats, sellDate: date, status: 'frozen' as const };
}

async function promoteAndPrewarmKeepers(repo: FactoryCohortRepository, cohortId: string) {
  const keepers = await repo.listKeepers(cohortId);
  let promoted = 0;
  let prewarmed = 0;

  await mapWithConcurrency(keepers, 4, async (member) => {
    let leadId = member.leadId;
    try {
      if (!leadId) {
        const lead = await crm.ensureLeadFromBusiness({
          businessId: member.businessId,
          status: 'NEW',
          owner: 'operator',
          priority: 'high',
        });
        await repo.setMemberLead(member.id, lead.id);
        leadId = lead.id;
        promoted += 1;
      }
    } catch (err) {
      logger.error('Factory keeper promote failed', {
        memberId: member.id,
        businessId: member.businessId,
        error: String(err),
      });
      return;
    }

    if (member.caseFile || !leadId) return;
    try {
      const caseFile = await buildKeeperCaseFile(leadId);
      if (!caseFile) return;
      await repo.setMemberCaseFile(member.id, caseFile);
      prewarmed += 1;
    } catch (err) {
      logger.warn('Factory case file pre-warm skipped', {
        memberId: member.id,
        leadId,
        error: String(err),
      });
    }
  });

  return { promoted, prewarmed };
}

async function buildKeeperCaseFile(leadId: string): Promise<Record<string, unknown> | null> {
  const { lead } = await crm.getLeadWithDetails(leadId);
  if (!lead) return null;
  const account = await accounts.getById(lead.accountId);
  const suppressed = account ? await accounts.isSuppressed(account) : false;
  const [profile, websiteBrief] = await Promise.all([
    intelligence.getBiProfileByBusinessId(lead.businessId),
    qualification.getOpportunityBrief(lead.businessId),
  ]);
  const normalizedProfile = profile ? normalizeBusinessIntelligenceProfile(profile.profile) : null;
  const caseFile = buildCaseFile({
    profile: normalizedProfile,
    websiteBrief,
    pursuitContext: {
      leadId: lead.id,
      status: lead.status,
      lastOutreach: null,
      nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    },
    suppressed,
  });
  return caseFile ? (JSON.parse(JSON.stringify(caseFile)) as Record<string, unknown>) : null;
}
