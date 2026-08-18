import {
  getDb,
  accounts,
  businesses,
  leadScores,
  leads,
  outreachDrafts,
  outreachMessages,
  outreachTemplates,
} from '@agency/database';
import type { OpportunityType } from '@agency/scoring';
import type { OutreachDraftChannel } from './draft-channel';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  notInArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { DEFAULT_OUTREACH_TEMPLATES } from './default-templates';

const TERMINAL_LEAD_STATUSES = ['CLOSED_WON', 'CLOSED_LOST', 'ARCHIVED'] as const;

export type OutreachQueueLeadRow = {
  lead: typeof leads.$inferSelect;
  business: typeof businesses.$inferSelect;
  account: typeof accounts.$inferSelect;
  leadScore: typeof leadScores.$inferSelect | null;
};

export type OutreachQueuePagedResult = {
  items: OutreachQueueLeadRow[];
  total: number;
  page: number;
  limit: number;
};

export class OutreachRepository {
  async createTemplate(data: {
    name: string;
    subject?: string;
    body: string;
    channel: string;
    opportunityType?: OpportunityType | null;
  }) {
    const db = getDb();
    const [t] = await db.insert(outreachTemplates).values(data).returning();
    return t;
  }

  async listTemplates() {
    const db = getDb();
    return db
      .select()
      .from(outreachTemplates)
      .orderBy(outreachTemplates.opportunityType, desc(outreachTemplates.createdAt));
  }

  async getTemplateByOpportunityType(type: OpportunityType) {
    const db = getDb();
    const [t] = await db
      .select()
      .from(outreachTemplates)
      .where(eq(outreachTemplates.opportunityType, type))
      .orderBy(desc(outreachTemplates.createdAt))
      .limit(1);
    return t ?? null;
  }

  async ensureDefaultTemplates() {
    const db = getDb();
    let created = 0;
    for (const def of DEFAULT_OUTREACH_TEMPLATES) {
      const [existing] = await db
        .select({ id: outreachTemplates.id })
        .from(outreachTemplates)
        .where(eq(outreachTemplates.opportunityType, def.opportunityType))
        .limit(1);
      if (existing) continue;
      await db.insert(outreachTemplates).values({
        name: def.name,
        subject: def.subject,
        body: def.body,
        channel: def.channel,
        opportunityType: def.opportunityType,
      });
      created++;
    }
    return { created, total: DEFAULT_OUTREACH_TEMPLATES.length };
  }

  async getTemplate(id: string) {
    const db = getDb();
    const [t] = await db.select().from(outreachTemplates).where(eq(outreachTemplates.id, id));
    return t ?? null;
  }

  async getLeadMergeData(leadId: string) {
    const db = getDb();
    const [row] = await db
      .select({ lead: leads, business: businesses, account: accounts })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .innerJoin(accounts, eq(leads.accountId, accounts.id))
      .where(eq(leads.id, leadId));
    return row ?? null;
  }

  async listLeadsForExport(options: {
    statuses: string[];
    excludeContactedToday?: boolean;
    owner?: string;
  }) {
    const db = getDb();
    const priorityOrder = sql`CASE ${leads.priority}
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4 END`;

    let contactedTodayIds: string[] = [];
    if (options.excludeContactedToday) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const rows = await db
        .select({ leadId: outreachMessages.leadId })
        .from(outreachMessages)
        .where(gte(outreachMessages.sentAt, startOfDay));
      contactedTodayIds = [...new Set(rows.map((r) => r.leadId))];
    }

    const filters = [inArray(leads.status, options.statuses)];
    if (options.owner) {
      filters.push(eq(leads.owner, options.owner));
    }
    if (contactedTodayIds.length > 0) {
      filters.push(notInArray(leads.id, contactedTodayIds));
    }
    const where = and(...filters);

    return db
      .select({
        lead: leads,
        business: businesses,
        account: accounts,
        leadScore: leadScores,
      })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .innerJoin(accounts, eq(leads.accountId, accounts.id))
      .leftJoin(leadScores, eq(leadScores.businessId, businesses.id))
      .where(where)
      .orderBy(priorityOrder, desc(leads.updatedAt));
  }

  async createMessage(data: {
    leadId: string;
    templateId?: string;
    subject?: string;
    body: string;
    channel: string;
    sentAt?: Date;
  }) {
    const db = getDb();
    const [m] = await db.insert(outreachMessages).values(data).returning();
    return m;
  }

  async listMessages(leadId?: string) {
    const db = getDb();
    if (leadId) {
      return db
        .select()
        .from(outreachMessages)
        .where(eq(outreachMessages.leadId, leadId))
        .orderBy(desc(outreachMessages.createdAt));
    }
    return db.select().from(outreachMessages).orderBy(desc(outreachMessages.createdAt));
  }

  async listMessagesForLeads(leadIds: string[]) {
    if (leadIds.length === 0) return [];
    const db = getDb();
    return db
      .select()
      .from(outreachMessages)
      .where(inArray(outreachMessages.leadId, leadIds))
      .orderBy(desc(outreachMessages.sentAt), desc(outreachMessages.createdAt));
  }

  async listDraftsForLeads(leadIds: string[]) {
    if (leadIds.length === 0) return [];
    const db = getDb();
    return db
      .select()
      .from(outreachDrafts)
      .where(inArray(outreachDrafts.leadId, leadIds));
  }

  async getDraftForLead(leadId: string, channel: OutreachDraftChannel) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(outreachDrafts)
      .where(and(eq(outreachDrafts.leadId, leadId), eq(outreachDrafts.channel, channel)))
      .limit(1);
    return row ?? null;
  }

  private buildOutreachQueueConditions(input: {
    statuses: string[];
    owner?: string;
    channel?: 'email' | 'whatsapp' | 'phone' | 'any';
    followUpDue?: 'overdue' | 'upcoming' | 'any';
    q?: string;
  }): SQL[] {
    const conditions: SQL[] = [
      inArray(leads.status, input.statuses),
      notInArray(leads.status, [...TERMINAL_LEAD_STATUSES]),
    ];
    if (input.owner) conditions.push(eq(leads.owner, input.owner));

    const now = new Date();
    if (input.followUpDue === 'overdue') {
      conditions.push(isNotNull(leads.nextFollowUpAt), lte(leads.nextFollowUpAt, now));
    } else if (input.followUpDue === 'upcoming') {
      conditions.push(isNotNull(leads.nextFollowUpAt), gt(leads.nextFollowUpAt, now));
    }

    if (input.channel === 'email') {
      conditions.push(
        or(
          sql`trim(coalesce(${accounts.email}, '')) <> ''`,
          sql`trim(coalesce(${businesses.email}, '')) <> ''`,
        )!,
      );
    } else if (input.channel === 'phone' || input.channel === 'whatsapp') {
      conditions.push(
        or(
          sql`trim(coalesce(${accounts.phone}, '')) <> ''`,
          sql`trim(coalesce(${businesses.phone}, '')) <> ''`,
        )!,
      );
    }

    const q = input.q?.trim();
    if (q) {
      const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
      const textMatch = or(
        ilike(businesses.name, pattern),
        ilike(businesses.city, pattern),
        ilike(businesses.email, pattern),
        ilike(businesses.phone, pattern),
      );
      if (textMatch) conditions.push(textMatch);
    }

    return conditions;
  }

  private buildOutreachQueueOrder(
    sort: 'follow_up' | 'priority' | 'score' | 'updatedAt' | 'name',
    direction: 'asc' | 'desc',
  ) {
    const dir = direction === 'asc' ? asc : desc;
    const priorityOrder = sql`CASE ${leads.priority}
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
      ELSE 5 END`;

    switch (sort) {
      case 'priority':
        return [dir(priorityOrder), desc(leads.updatedAt), desc(leads.id)];
      case 'score':
        return [dir(leadScores.score), desc(leads.updatedAt), desc(leads.id)];
      case 'updatedAt':
        return [dir(leads.updatedAt), desc(leads.id)];
      case 'name':
        return [dir(businesses.name), desc(leads.updatedAt), desc(leads.id)];
      case 'follow_up':
      default:
        return [dir(leads.nextFollowUpAt), dir(priorityOrder), desc(leadScores.score), desc(leads.id)];
    }
  }

  async listLeadsForOutreachQueuePaged(input: {
    statuses: string[];
    owner?: string;
    channel?: 'email' | 'whatsapp' | 'phone' | 'any';
    followUpDue?: 'overdue' | 'upcoming' | 'any';
    sort: 'follow_up' | 'priority' | 'score' | 'updatedAt' | 'name';
    direction: 'asc' | 'desc';
    page: number;
    limit: number;
    q?: string;
  }): Promise<OutreachQueuePagedResult> {
    const db = getDb();
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    const offset = (page - 1) * limit;
    const conditions = this.buildOutreachQueueConditions(input);
    const where = and(...conditions);
    const orderBy = this.buildOutreachQueueOrder(input.sort, input.direction);

    const [totalRow] = await db
      .select({ value: count() })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .innerJoin(accounts, eq(leads.accountId, accounts.id))
      .leftJoin(leadScores, eq(leadScores.businessId, businesses.id))
      .where(where);

    const items = await db
      .select({
        lead: leads,
        business: businesses,
        account: accounts,
        leadScore: leadScores,
      })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .innerJoin(accounts, eq(leads.accountId, accounts.id))
      .leftJoin(leadScores, eq(leadScores.businessId, businesses.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    return {
      items,
      total: Number(totalRow?.value ?? 0),
      page,
      limit,
    };
  }
}
