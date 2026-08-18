import { logger } from '@agency/config';
import { CrmService } from '@agency/crm';
import { getDb, accounts, businesses, websiteAnalyses } from '@agency/database';
import {
  calendarDateInTimezone,
  demandJumpBlockReason,
  FACTORY_TIMEZONE,
  FactoryCohortRepository,
  hasWhatsAppHint,
  recommendPitchChannel,
  type DemandJumpBlock,
} from '@agency/discovery';
import { eq } from 'drizzle-orm';
import { type DemandJumpResult } from './factory-demand-copy';

export type { DemandJumpResult, DemandJumpBlock };
export { DEMAND_JUMP_REASON_COPY, pitchTodayHrefForLead } from './factory-demand-copy';

const crm = new CrmService();

export class FactoryDemandJump {
  constructor(private repo = new FactoryCohortRepository()) {}

  async jumpBusiness(businessId: string, signalId?: string): Promise<DemandJumpResult> {
    const sellDate = calendarDateInTimezone(new Date(), FACTORY_TIMEZONE);
    const cohort = await this.repo.getBySellDate(sellDate);
    const db = getDb();
    const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
    if (!business?.accountId) {
      return { jumped: false, reason: 'cohort_not_frozen' };
    }
    const [account] = await db.select().from(accounts).where(eq(accounts.id, business.accountId)).limit(1);
    if (!account) return { jumped: false, reason: 'cohort_not_frozen' };

    const [analysis] = await db
      .select()
      .from(websiteAnalyses)
      .where(eq(websiteAnalyses.businessId, businessId))
      .limit(1);
    const activeLead = await crm.getActiveLeadByAccount(account.id);
    const phone = account.phone ?? business.phone;
    const website = account.website ?? business.website;
    const metadata = account.metadata ?? business.metadata;

    const block = demandJumpBlockReason({
      cohortStatus: cohort?.status ?? null,
      phone,
      website,
      metadata,
      suppressed: account.suppressed,
      snoozedUntil: account.reviewSnoozedUntil,
      analysisHasWebsite: analysis?.hasWebsite ?? false,
      leadStatus: activeLead?.status ?? null,
    });
    if (block) return { jumped: false, reason: block };

    const lead = await crm.ensureLeadFromBusiness({
      businessId,
      status: 'NEW',
      owner: 'operator',
      priority: 'high',
    });
    const channel = recommendPitchChannel({
      phone,
      email: account.email ?? business.email,
      hasWhatsAppHint: hasWhatsAppHint({ website, metadata }),
    });
    const caseFile = { demandJump: true, signalId: signalId ?? null };

    const existing = await this.repo.getMemberByAccount(cohort!.id, account.id);
    if (existing?.role === 'keeper') {
      await this.repo.updateMember(existing.id, {
        leadId: lead.id,
        recommendedChannel: channel,
        caseFile: { ...(existing.caseFile ?? {}), ...caseFile },
      });
      return { jumped: true, already: true, leadId: lead.id, memberId: existing.id };
    }

    const rank = await this.repo.frontKeeperRank(cohort!.id);
    if (existing) {
      await this.repo.updateMember(existing.id, {
        role: 'keeper',
        missReason: null,
        rank,
        recommendedChannel: channel,
        leadId: lead.id,
        caseFile,
      });
      await this.repo.recountRoles(cohort!.id);
      logger.info('Demand jump restored dumpster row to Pitch today', {
        memberId: existing.id,
        businessId,
        sellDate,
      });
      return { jumped: true, leadId: lead.id, memberId: existing.id };
    }

    const member = await this.repo.insertMember(cohort!.id, {
      accountId: account.id,
      businessId,
      leadId: lead.id,
      role: 'keeper',
      rank,
      recommendedChannel: channel,
      caseFile,
    });
    await this.repo.recountRoles(cohort!.id);
    logger.info('Demand jump added keeper to frozen Pitch today', {
      memberId: member.id,
      businessId,
      sellDate,
    });
    return { jumped: true, leadId: lead.id, memberId: member.id };
  }
}

export async function tryDemandJump(businessId: string, signalId?: string): Promise<DemandJumpResult> {
  try {
    return await new FactoryDemandJump().jumpBusiness(businessId, signalId);
  } catch (err) {
    logger.warn('Demand jump failed', { businessId, error: String(err) });
    return { jumped: false, reason: 'cohort_not_frozen' };
  }
}
