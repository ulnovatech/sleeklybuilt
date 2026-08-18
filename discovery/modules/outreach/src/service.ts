import { AccountService } from '@agency/accounts';
import { CrmService } from '@agency/crm';
import {
  computeReachability,
  isValidEmailFormat,
  meetsMinReachability,
  type MinReachabilityLevel,
  type Reachability,
} from '@agency/scoring';
import type { OpportunityType } from '@agency/scoring';
import { platformSettings } from '@agency/settings';
import { hasContactPath, resolveExportStatuses, resolveOutreachQueueStatuses } from './export-gates';
import { assembleDraftExportCsv } from './export-drafts-csv';
import { OutreachRepository, type OutreachQueuePagedResult } from './repository';
import { buildMergeContext, mergeTemplate } from './template-merge';
import { composeOutreachBody } from './compose-outreach-body';
import type { OutreachDraftChannel } from './draft-channel';

/**
 * Pursuit export reachability from contact paths only.
 * Lead-score reachability is poisoned by alreadyContacted (always true for CRM pursuits).
 */
function contactReachabilityForExport(
  email?: string | null,
  phone?: string | null,
): Reachability {
  const emailTrimmed = email?.trim() ?? '';
  const phoneTrimmed = phone?.trim() ?? '';
  return computeReachability({
    hasEmail: Boolean(emailTrimmed),
    hasPhone: Boolean(phoneTrimmed),
    emailValid: emailTrimmed ? isValidEmailFormat(emailTrimmed) : undefined,
  });
}

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export class OutreachService {
  private repo = new OutreachRepository();
  private crm = new CrmService();
  private accounts = new AccountService();

  private mergeDataFromRow(row: {
    business: {
      name: string;
      city: string | null;
      website: string | null;
      email: string | null;
      phone: string | null;
      googleMapsUrl: string | null;
      sourceUrl: string | null;
    };
    account: {
      canonicalName: string;
      city: string | null;
      website: string | null;
      email: string | null;
      phone: string | null;
      googleMapsUrl: string | null;
      sourceUrl: string | null;
      suppressed: boolean;
    };
  }) {
    return buildMergeContext({
      businessName: row.business.name,
      canonicalName: row.account.canonicalName,
      city: row.account.city ?? row.business.city,
      website: row.account.website ?? row.business.website,
      email: row.account.email ?? row.business.email,
      phone: row.account.phone ?? row.business.phone,
      googleMapsUrl: row.account.googleMapsUrl ?? row.business.googleMapsUrl,
      sourceUrl: row.account.sourceUrl ?? row.business.sourceUrl,
      agencyBrand: platformSettings.getAgencySettings().brandName,
      agencySender: platformSettings.getAgencySettings().senderName,
      agencySignature: platformSettings.getAgencySettings().signature,
    });
  }

  private async assertLeadCanReceiveOutreach(leadId: string) {
    const row = await this.repo.getLeadMergeData(leadId);
    if (!row) throw new Error('Lead not found');
    if (await this.accounts.isSuppressed(row.account)) {
      throw new Error('Account is suppressed — outreach blocked');
    }
    const email = row.account.email ?? row.business.email;
    const phone = row.account.phone ?? row.business.phone;
    if (!hasContactPath(email, phone)) {
      throw new Error('Lead has no email or phone contact path');
    }
    return row;
  }

  /** @deprecated Template merge preview — not the operator-primary pitch path. Use on-demand LLM drafts. */
  async previewMessage(leadId: string, templateId: string, options?: { opener?: string | null }) {
    await platformSettings.ensureLoaded();
    const row = await this.assertLeadCanReceiveOutreach(leadId);
    const template = await this.repo.getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    const ctx = this.mergeDataFromRow(row);
    const mergedBody = mergeTemplate(template.body, ctx);
    const body = composeOutreachBody(mergedBody, options?.opener, ctx.signature);

    return {
      leadId,
      templateId,
      channel: template.channel,
      subject: template.subject ? mergeTemplate(template.subject, ctx) : null,
      body,
      context: ctx,
      business: row.business.name,
      leadStatus: row.lead.status,
      openerApplied: !!options?.opener?.trim(),
    };
  }

  /** @deprecated Template merge CSV — use exportDraftsCsv for ulndash handoff. */
  async exportTemplateCsv(options: {
    templateId: string;
    date?: string;
    includeUnreviewed?: boolean;
    owner?: string;
    minReachability?: MinReachabilityLevel;
  }) {
    const template = await this.repo.getTemplate(options.templateId);
    if (!template) throw new Error('Template not found');

    const statuses = resolveExportStatuses(!!options.includeUnreviewed);
    const rows = await this.repo.listLeadsForExport({
      statuses,
      excludeContactedToday: options.date === 'today',
      owner: options.owner,
    });

    const header = ['business', 'email', 'phone', 'subject', 'body', 'maps_url'];
    const lines = [header.join(',')];
    let skippedNoContact = 0;
    let skippedSuppressed = 0;
    let skippedReachability = 0;
    const minReachability = options.minReachability ?? 'low';

    for (const row of rows) {
      const email = row.account.email ?? row.business.email;
      const phone = row.account.phone ?? row.business.phone;
      if (!hasContactPath(email, phone)) {
        skippedNoContact++;
        continue;
      }
      if (await this.accounts.isSuppressed(row.account)) {
        skippedSuppressed++;
        continue;
      }
      const reachability = contactReachabilityForExport(email, phone);
      if (!meetsMinReachability(reachability, minReachability)) {
        skippedReachability++;
        continue;
      }

      const ctx = this.mergeDataFromRow(row);
      const subject = template.subject ? mergeTemplate(template.subject, ctx) : '';
      const body = composeOutreachBody(mergeTemplate(template.body, ctx), null, ctx.signature);
      lines.push(
        [
          csvEscape(ctx.business),
          csvEscape(ctx.email),
          csvEscape(ctx.phone),
          csvEscape(subject),
          csvEscape(body),
          csvEscape(ctx.mapsUrl),
        ].join(','),
      );
    }

    const dateSuffix = options.date === 'today' ? new Date().toISOString().slice(0, 10) : 'all';
    return {
      csv: lines.join('\n'),
      filename: `outreach-template-export-${dateSuffix}.csv`,
      count: lines.length - 1,
      skippedNoContact,
      skippedSuppressed,
      skippedReachability,
      skippedNoDraft: 0,
      statuses,
      minReachability,
      exportMode: 'template' as const,
    };
  }

  async exportDraftsCsv(options: {
    channel?: OutreachDraftChannel;
    date?: string;
    includeUnreviewed?: boolean;
    owner?: string;
    minReachability?: MinReachabilityLevel;
  }) {
    const channel = options.channel ?? 'email';
    const statuses = resolveExportStatuses(!!options.includeUnreviewed);
    const rows = await this.repo.listLeadsForExport({
      statuses,
      excludeContactedToday: options.date === 'today',
      owner: options.owner,
    });

    const minReachability = options.minReachability ?? 'low';
    const leadIds = rows.map((row) => row.lead.id);
    const drafts = await this.repo.listDraftsForLeads(leadIds);
    const draftByLeadId = new Map(
      drafts.filter((draft) => draft.channel === channel).map((draft) => [draft.leadId, draft]),
    );

    const candidates = [];
    for (const row of rows) {
      const email = row.account.email ?? row.business.email;
      const phone = row.account.phone ?? row.business.phone;
      const ctx = this.mergeDataFromRow(row);
      candidates.push({
        leadId: row.lead.id,
        business: ctx.business,
        email: ctx.email,
        phone: ctx.phone,
        mapsUrl: ctx.mapsUrl,
        reachability: contactReachabilityForExport(email, phone),
        hasContact: hasContactPath(email, phone),
        suppressed: await this.accounts.isSuppressed(row.account),
      });
    }

    const assembled = assembleDraftExportCsv({
      channel,
      candidates,
      draftsByLeadId: draftByLeadId,
      minReachability,
    });

    const dateSuffix = options.date === 'today' ? new Date().toISOString().slice(0, 10) : 'all';
    return {
      csv: assembled.csv,
      filename: `outreach-drafts-${channel}-${dateSuffix}.csv`,
      count: assembled.count,
      skippedNoContact: assembled.skippedNoContact,
      skippedSuppressed: assembled.skippedSuppressed,
      skippedReachability: assembled.skippedReachability,
      skippedNoDraft: assembled.skippedNoDraft,
      statuses,
      minReachability,
      exportMode: assembled.exportMode,
      channel: assembled.channel,
    };
  }

  async exportCsv(options: {
    templateId?: string;
    channel?: OutreachDraftChannel;
    date?: string;
    includeUnreviewed?: boolean;
    owner?: string;
    minReachability?: MinReachabilityLevel;
  }) {
    if (options.templateId) {
      return this.exportTemplateCsv({
        templateId: options.templateId,
        date: options.date,
        includeUnreviewed: options.includeUnreviewed,
        owner: options.owner,
        minReachability: options.minReachability,
      });
    }
    return this.exportDraftsCsv({
      channel: options.channel,
      date: options.date,
      includeUnreviewed: options.includeUnreviewed,
      owner: options.owner,
      minReachability: options.minReachability,
    });
  }

  listOutreachQueuePaged(input: {
    status?: string;
    owner?: string;
    channel?: 'email' | 'whatsapp' | 'phone' | 'any';
    followUpDue?: 'overdue' | 'upcoming' | 'any';
    sort: 'follow_up' | 'priority' | 'score' | 'updatedAt' | 'name';
    direction: 'asc' | 'desc';
    page: number;
    limit: number;
    q?: string;
  }): Promise<OutreachQueuePagedResult> {
    const statuses = resolveOutreachQueueStatuses(input.status);
    return this.repo.listLeadsForOutreachQueuePaged({
      statuses,
      owner: input.owner,
      channel: input.channel,
      followUpDue: input.followUpDue,
      sort: input.sort,
      direction: input.direction,
      page: input.page,
      limit: input.limit,
      q: input.q,
    });
  }

  /** Raw queue rows plus drafts/messages maps for orchestrator enrichment. */
  async loadOutreachQueueContext(leadIds: string[]) {
    const [drafts, messages] = await Promise.all([
      this.repo.listDraftsForLeads(leadIds),
      this.repo.listMessagesForLeads(leadIds),
    ]);
    const draftsByLead = new Map<string, typeof drafts>();
    for (const draft of drafts) {
      const list = draftsByLead.get(draft.leadId) ?? [];
      list.push(draft);
      draftsByLead.set(draft.leadId, list);
    }
    const lastMessageByLead = new Map<string, (typeof messages)[number]>();
    for (const message of messages) {
      if (!lastMessageByLead.has(message.leadId)) {
        lastMessageByLead.set(message.leadId, message);
      }
    }
    return { draftsByLead, lastMessageByLead };
  }

  createTemplate(data: {
    name: string;
    subject?: string;
    body: string;
    channel: string;
    opportunityType?: OpportunityType | null;
  }) {
    return this.repo.createTemplate(data);
  }

  async ensureDefaultTemplates() {
    return this.repo.ensureDefaultTemplates();
  }

  async listTemplates() {
    await this.repo.ensureDefaultTemplates();
    return this.repo.listTemplates();
  }

  async resolveTemplateForOpportunityType(type: OpportunityType) {
    await this.repo.ensureDefaultTemplates();
    const match = await this.repo.getTemplateByOpportunityType(type);
    if (match) return match;
    return this.repo.getTemplateByOpportunityType('general');
  }

  async sendMessage(data: {
    leadId: string;
    templateId?: string;
    subject?: string;
    body: string;
    channel: string;
    markContacted?: boolean;
  }) {
    await this.assertLeadCanReceiveOutreach(data.leadId);

    const message = await this.repo.createMessage({
      ...data,
      sentAt: new Date(),
    });
    if (data.markContacted !== false) {
      await this.crm.recordOutreachSent(data.leadId);
    }
    return message;
  }

  listMessages(leadId?: string) {
    return this.repo.listMessages(leadId);
  }
}
