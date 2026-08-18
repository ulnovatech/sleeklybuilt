import { getDb, leads, leadNotes, leadActivities, businesses } from '@agency/database';
import type { CrmFollowUpsListQuery, CrmLeadsListQuery, PaginatedResult } from '@agency/validation';
import { FOLLOW_UP_STAGES, paginatedResult } from '@agency/validation';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  isNotNull,
  lte,
  notInArray,
  or,
  type SQL,
} from 'drizzle-orm';
import { TERMINAL_LEAD_STATUSES } from './state-machine';

export type LeadListRow = {
  lead: typeof leads.$inferSelect;
  business: typeof businesses.$inferSelect;
};

export type ListLeadsPagedInput = CrmLeadsListQuery & {
  owner?: string;
};

export class CrmRepository {
  async createLead(data: {
    accountId: string;
    businessId: string;
    priority?: string;
    owner?: string;
    status?: string;
  }) {
    const db = getDb();
    const [lead] = await db
      .insert(leads)
      .values({
        accountId: data.accountId,
        businessId: data.businessId,
        status: data.status ?? 'NEW',
        priority: data.priority ?? 'medium',
        owner: data.owner ?? 'operator',
      })
      .returning();
    return lead;
  }

  async getLead(id: string) {
    const db = getDb();
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead ?? null;
  }

  async getLeadByBusiness(businessId: string) {
    const db = getDb();
    const [lead] = await db.select().from(leads).where(eq(leads.businessId, businessId));
    return lead ?? null;
  }

  async getLeadByAccount(accountId: string) {
    const db = getDb();
    const [lead] = await db.select().from(leads).where(eq(leads.accountId, accountId));
    return lead ?? null;
  }

  async getActiveLeadByAccount(accountId: string) {
    const db = getDb();
    const [lead] = await db
      .select()
      .from(leads)
      .where(
        and(eq(leads.accountId, accountId), notInArray(leads.status, TERMINAL_LEAD_STATUSES)),
      )
      .limit(1);
    return lead ?? null;
  }

  async listLeads(owner?: string) {
    const db = getDb();
    const query = db
      .select({ lead: leads, business: businesses })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id));

    if (owner) {
      return query.where(eq(leads.owner, owner)).orderBy(desc(leads.updatedAt));
    }

    return query.orderBy(desc(leads.updatedAt));
  }

  async listLeadsPaged(input: ListLeadsPagedInput): Promise<PaginatedResult<LeadListRow>> {
    const db = getDb();
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    const offset = (page - 1) * limit;
    const conditions = this.buildLeadListConditions(input);

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy = this.buildLeadListOrder(input.sort, input.direction);

    const [totalRow] = await db
      .select({ value: count() })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .where(where);

    const items = await db
      .select({ lead: leads, business: businesses })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    return paginatedResult(items, Number(totalRow?.value ?? 0), page, limit);
  }

  private buildLeadListConditions(input: ListLeadsPagedInput): SQL[] {
    const conditions: SQL[] = [];
    if (input.owner) conditions.push(eq(leads.owner, input.owner));
    if (input.status) conditions.push(eq(leads.status, input.status));
    if (input.priority) conditions.push(eq(leads.priority, input.priority));

    if (input.followUpDue === 'overdue') {
      conditions.push(isNotNull(leads.nextFollowUpAt), lte(leads.nextFollowUpAt, new Date()));
    } else if (input.followUpDue === 'upcoming') {
      conditions.push(isNotNull(leads.nextFollowUpAt), gt(leads.nextFollowUpAt, new Date()));
    }

    const q = input.q?.trim();
    if (q) {
      const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
      const textMatch = or(
        ilike(businesses.name, pattern),
        ilike(businesses.city, pattern),
        ilike(businesses.email, pattern),
        ilike(businesses.phone, pattern),
        ilike(leads.status, pattern),
        ilike(leads.priority, pattern),
      );
      if (textMatch) conditions.push(textMatch);
    }

    return conditions;
  }

  private buildLeadListOrder(sort: CrmLeadsListQuery['sort'], direction: 'asc' | 'desc') {
    const dir = direction === 'asc' ? asc : desc;
    switch (sort) {
      case 'createdAt':
        return [dir(leads.createdAt), desc(leads.id)];
      case 'status':
        return [dir(leads.status), desc(leads.updatedAt), desc(leads.id)];
      case 'priority':
        return [dir(leads.priority), desc(leads.updatedAt), desc(leads.id)];
      case 'nextFollowUpAt':
        return [dir(leads.nextFollowUpAt), desc(leads.id)];
      case 'name':
        return [dir(businesses.name), desc(leads.id)];
      case 'updatedAt':
      default:
        return [dir(leads.updatedAt), desc(leads.id)];
    }
  }

  async updateLeadStatus(id: string, status: string) {
    const db = getDb();
    const [lead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async updateLead(id: string, data: { priority?: string; nextFollowUpAt?: Date | null }) {
    const db = getDb();
    const [lead] = await db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async addNote(leadId: string, content: string) {
    const db = getDb();
    const [note] = await db.insert(leadNotes).values({ leadId, content }).returning();
    return note;
  }

  async listNotes(leadId: string) {
    const db = getDb();
    return db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.createdAt));
  }

  async addActivity(leadId: string, type: string, description: string, metadata?: string) {
    const db = getDb();
    const [activity] = await db
      .insert(leadActivities)
      .values({ leadId, type, description, metadata })
      .returning();
    return activity;
  }

  async listActivities(leadId: string) {
    const db = getDb();
    return db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
  }

  async listOverdueFollowUps(owner?: string) {
    const db = getDb();
    const now = new Date();
    const conditions = [
      eq(leads.status, 'CONTACTED'),
      isNotNull(leads.nextFollowUpAt),
      lte(leads.nextFollowUpAt, now),
    ];
    if (owner) {
      conditions.push(eq(leads.owner, owner));
    }
    return db
      .select({ lead: leads, business: businesses })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .where(and(...conditions))
      .orderBy(leads.nextFollowUpAt);
  }

  async listFollowUpsPaged(
    input: CrmFollowUpsListQuery & { owner?: string },
  ): Promise<PaginatedResult<LeadListRow>> {
    const db = getDb();
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    const offset = (page - 1) * limit;
    const now = new Date();
    const conditions: SQL[] = [
      input.status
        ? eq(leads.status, input.status)
        : inArray(leads.status, [...FOLLOW_UP_STAGES]),
      isNotNull(leads.nextFollowUpAt),
      lte(leads.nextFollowUpAt, now),
    ];
    if (input.owner) conditions.push(eq(leads.owner, input.owner));

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

    const where = and(...conditions);
    const orderBy = this.buildFollowUpOrder(input.sort, input.direction);

    const [totalRow] = await db
      .select({ value: count() })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .where(where);

    const items = await db
      .select({ lead: leads, business: businesses })
      .from(leads)
      .innerJoin(businesses, eq(leads.businessId, businesses.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    return paginatedResult(items, Number(totalRow?.value ?? 0), page, limit);
  }

  private buildFollowUpOrder(
    sort: 'nextFollowUpAt' | 'updatedAt' | 'name',
    direction: 'asc' | 'desc',
  ) {
    const dir = direction === 'asc' ? asc : desc;
    switch (sort) {
      case 'updatedAt':
        return [dir(leads.updatedAt), desc(leads.id)];
      case 'name':
        return [dir(businesses.name), asc(leads.nextFollowUpAt), desc(leads.id)];
      case 'nextFollowUpAt':
      default:
        return [dir(leads.nextFollowUpAt), desc(leads.id)];
    }
  }
}
