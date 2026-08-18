import { AccountService } from '@agency/accounts';
import {
  buildCaseFile,
  IntelligenceService,
  normalizeBusinessIntelligenceProfile,
} from '@agency/intelligence';
import type { OutreachQueueLeadRow } from '@agency/outreach';
import { OutreachService } from '@agency/outreach';
import { QualificationService } from '@agency/qualification';
import type { OutreachQueueListQuery } from '@agency/validation';

export type OutreachQueueItem = {
  leadId: string;
  status: string;
  priority: string;
  nextFollowUpAt: string | null;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    city: string | null;
    industry: string | null;
  };
  presenceClass: 'greenfield' | 'social_only' | 'link_in_bio' | 'redesign';
  score: number | null;
  reachability: string | null;
  topWeaknesses: string[];
  pitchAngle: string | null;
  caseFileStatus: 'ready' | 'partial' | 'processing' | 'blocked';
  channels: {
    email: boolean;
    phone: boolean;
    whatsapp: 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked' | 'none';
  };
  drafts: {
    email: boolean;
    whatsapp: boolean;
    phone: boolean;
    follow_up: boolean;
  };
  lastOutreach: {
    channel: string;
    subject: string | null;
    sentAt: string;
  } | null;
  suppressed: boolean;
};

const outreach = new OutreachService();
const intelligence = new IntelligenceService();
const qualification = new QualificationService();
const accounts = new AccountService();

function draftFlags(drafts: Array<{ channel: string }> | undefined) {
  const channels = new Set(drafts?.map((d) => d.channel) ?? []);
  return {
    email: channels.has('email'),
    whatsapp: channels.has('whatsapp'),
    phone: channels.has('phone'),
    follow_up: channels.has('follow_up'),
  };
}

async function enrichQueueRow(
  row: OutreachQueueLeadRow,
  context: Awaited<ReturnType<OutreachService['loadOutreachQueueContext']>>,
): Promise<OutreachQueueItem | null> {
  const email = row.account.email ?? row.business.email;
  const phone = row.account.phone ?? row.business.phone;
  const suppressed = await accounts.isSuppressed(row.account);
  if (suppressed) return null;

  const [profile, websiteBrief] = await Promise.all([
    intelligence.getBiProfileByBusinessId(row.business.id),
    qualification.getOpportunityBrief(row.business.id),
  ]);

  const lastMessage = context.lastMessageByLead.get(row.lead.id);
  const caseFile = buildCaseFile({
    profile: profile ? normalizeBusinessIntelligenceProfile(profile.profile) : null,
    websiteBrief,
    pursuitContext: {
      leadId: row.lead.id,
      status: row.lead.status,
      lastOutreach: lastMessage
        ? {
            channel: lastMessage.channel,
            subject: lastMessage.subject ?? null,
            body: lastMessage.body ?? null,
            sentAt: (lastMessage.sentAt ?? lastMessage.createdAt).toISOString(),
          }
        : null,
      nextFollowUpAt: row.lead.nextFollowUpAt?.toISOString() ?? null,
    },
  });

  const whatsappStatus = caseFile?.contact.whatsapp.status ?? (phone?.trim() ? 'wa_probable' : 'wa_blocked');

  return {
    leadId: row.lead.id,
    status: row.lead.status,
    priority: row.lead.priority,
    nextFollowUpAt: row.lead.nextFollowUpAt?.toISOString() ?? null,
    updatedAt: row.lead.updatedAt.toISOString(),
    business: {
      id: row.business.id,
      name: row.business.name,
      city: row.business.city,
      industry: row.business.industry,
    },
    presenceClass: caseFile?.presence.class ?? 'greenfield',
    score: caseFile?.score ?? row.leadScore?.score ?? null,
    reachability: caseFile?.reachability ?? row.leadScore?.reachability ?? null,
    topWeaknesses: (caseFile?.weaknesses ?? []).slice(0, 2).map((w) => w.label),
    pitchAngle: caseFile?.pitchAngle ?? null,
    caseFileStatus: caseFile?.status ?? 'processing',
    channels: {
      email: Boolean(email?.trim()),
      phone: Boolean(phone?.trim()),
      whatsapp: whatsappStatus,
    },
    drafts: draftFlags(context.draftsByLead.get(row.lead.id)),
    lastOutreach: lastMessage
      ? {
          channel: lastMessage.channel,
          subject: lastMessage.subject ?? null,
          sentAt: (lastMessage.sentAt ?? lastMessage.createdAt).toISOString(),
        }
      : null,
    suppressed: false,
  };
}

export async function listOutreachQueue(input: OutreachQueueListQuery & { owner?: string }) {
  const page = await outreach.listOutreachQueuePaged({
    status: input.status,
    owner: input.owner,
    channel: input.channel,
    followUpDue: input.followUpDue,
    sort: input.sort,
    direction: input.direction,
    page: input.page,
    limit: input.limit,
    q: input.q,
  });

  const leadIds = page.items.map((item) => item.lead.id);
  const context = await outreach.loadOutreachQueueContext(leadIds);

  const enriched: OutreachQueueItem[] = [];
  for (const row of page.items) {
    const item = await enrichQueueRow(row, context);
    if (!item) continue;
    if (input.channel === 'whatsapp') {
      const wa = item.channels.whatsapp;
      if (wa !== 'wa_ready' && wa !== 'wa_probable') continue;
    }
    enriched.push(item);
  }

  return {
    items: enriched,
    total: page.total,
    page: page.page,
    limit: page.limit,
    ownerScope: input.owner ?? 'all',
  };
}
