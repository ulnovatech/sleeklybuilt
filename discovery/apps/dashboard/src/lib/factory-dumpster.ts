import { AccountService } from '@agency/accounts';
import { logger } from '@agency/config';
import { CrmService } from '@agency/crm';
import {
  calendarDateInTimezone,
  FACTORY_TIMEZONE,
  FactoryCohortRepository,
  hasWhatsAppHint,
  recommendPitchChannel,
} from '@agency/discovery';
import { getDb, accounts, businesses } from '@agency/database';
import { eq } from 'drizzle-orm';

export type DumpsterAction = 'restore' | 'pitch_anyway' | 'snooze' | 'suppress' | 'mark_has_website';

export type DumpsterOpResult = { id: string; ok: boolean; leadId?: string | null; error?: string };

const crm = new CrmService();
const accountService = new AccountService();

export class FactoryDumpsterOps {
  constructor(private repo = new FactoryCohortRepository()) {}

  async apply(action: DumpsterAction, memberIds: string[], opts?: { snoozeDays?: number }): Promise<DumpsterOpResult[]> {
    const results: DumpsterOpResult[] = [];
    for (const id of [...new Set(memberIds)]) {
      try {
        const leadId = await this.applyOne(action, id, opts?.snoozeDays ?? 7);
        results.push({ id, ok: true, leadId });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        logger.warn('Dumpster op failed', { action, memberId: id, error });
        results.push({ id, ok: false, error });
      }
    }
    return results;
  }

  private async applyOne(action: DumpsterAction, memberId: string, snoozeDays: number) {
    const member = await this.repo.getMember(memberId);
    if (!member) throw new Error('Dumpster row not found');
    if (member.role !== 'dumpster') throw new Error('Row is not in dumpster');
    const cohort = await this.repo.getById(member.cohortId);
    if (!cohort || cohort.status !== 'frozen') throw new Error('Cohort is not frozen');

    if (action === 'restore') {
      if (member.missReason === 'suppressed') await accountService.unsuppress(member.accountId);
      const lead = await crm.ensureLeadFromBusiness({
        businessId: member.businessId,
        status: 'NEW',
        owner: 'operator',
        priority: 'high',
      });
      const rank = await this.repo.nextKeeperRank(member.cohortId);
      const channel = await this.channelFor(member.businessId, member.accountId);
      await this.repo.updateMember(member.id, {
        role: 'keeper',
        missReason: null,
        rank,
        recommendedChannel: channel,
        leadId: lead.id,
      });
      await this.repo.recountRoles(member.cohortId);
      return lead.id;
    }

    if (action === 'pitch_anyway') {
      const lead = await crm.ensureLeadFromBusiness({
        businessId: member.businessId,
        status: 'NEW',
        owner: 'operator',
        priority: 'high',
      });
      await this.repo.updateMember(member.id, { leadId: lead.id });
      return lead.id;
    }

    if (action === 'snooze') {
      await accountService.snoozeReview(member.accountId, snoozeDays);
      return member.leadId;
    }

    if (action === 'suppress') {
      await accountService.suppress(member.accountId, 'dumpster');
      await this.repo.updateMember(member.id, { missReason: 'suppressed' });
      return member.leadId;
    }

    await accountService.markHasWebsite(member.accountId);
    await this.repo.updateMember(member.id, { missReason: 'has_website' });
    return member.leadId;
  }

  private async channelFor(businessId: string, accountId: string) {
    const db = getDb();
    const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
    const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
    const phone = account?.phone ?? business?.phone;
    const email = account?.email ?? business?.email;
    const website = account?.website ?? business?.website;
    const metadata = account?.metadata ?? business?.metadata;
    return recommendPitchChannel({
      phone,
      email,
      hasWhatsAppHint: hasWhatsAppHint({ website, metadata }),
    });
  }
}

export function dumpsterSellDate(sellDate?: string) {
  return sellDate && /^\d{4}-\d{2}-\d{2}$/.test(sellDate)
    ? sellDate
    : calendarDateInTimezone(new Date(), FACTORY_TIMEZONE);
}
