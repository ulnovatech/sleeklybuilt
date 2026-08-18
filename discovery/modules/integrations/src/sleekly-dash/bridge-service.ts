import {
  acquisitionSettings,
  businesses,
  crmBridgeSync,
  getDb,
  leadOutcomes,
  leadScores,
  leads,
} from '@agency/database';
import { CrmRepository } from '@agency/crm';
import { IntentRepository } from '@agency/intent';
import { and, desc, eq } from 'drizzle-orm';
import {
  fetchInbound,
  fetchOutcomes,
  upsertProspect,
  type SleeklyDashOutcomeRow,
} from './client';
import { getSleeklyDashConfig, isSleeklyDashConfigured } from './config';

export const CRM_BRIDGE_WATERMARK_KEY = 'crm.bridge.watermarks';

export type CrmBridgeWatermarks = {
  outcomesSince: string | null;
  inboundSince: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
};

export type PushLeadResult = {
  leadId: string;
  accountId: string;
  created: boolean;
  updated: boolean;
  prospectId: number | null;
};

function mapPriority(priority: string | null | undefined): 'high' | 'medium' | 'low' {
  const p = (priority ?? 'medium').toLowerCase();
  if (p === 'high' || p === 'low') return p;
  return 'medium';
}

export class SleeklyDashBridgeService {
  private crmRepo = new CrmRepository();
  private intentRepo = new IntentRepository();

  async getStatus() {
    const configured = await isSleeklyDashConfigured();
    const watermarks = await this.getWatermarks();
    return {
      configured,
      watermarks,
      message: configured
        ? 'SleeklyBuilt CRM bridge ready'
        : 'Set SLEEKLY_DASH_BASE_URL and SLEEKLY_DASH_SERVICE_TOKEN (or store credentials in Settings)',
    };
  }

  async getLastPushForLead(leadId: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(crmBridgeSync)
      .where(and(eq(crmBridgeSync.leadId, leadId), eq(crmBridgeSync.direction, 'push_prospect')))
      .orderBy(desc(crmBridgeSync.createdAt))
      .limit(1);
    return row ?? null;
  }

  async pushLead(leadId: string): Promise<PushLeadResult> {
    const config = await getSleeklyDashConfig();
    if (!config) {
      throw new Error(
        'SleeklyBuilt CRM bridge is not configured. Set SLEEKLY_DASH_BASE_URL and SLEEKLY_DASH_SERVICE_TOKEN.',
      );
    }

    const lead = await this.crmRepo.getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    const db = getDb();
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, lead.businessId))
      .limit(1);
    if (!business) throw new Error('Business not found for lead');

    const [scoreRow] = await db
      .select()
      .from(leadScores)
      .where(eq(leadScores.businessId, lead.businessId))
      .limit(1);

    const discoveryAccountId = lead.accountId;
    const body = {
      discovery_account_id: discoveryAccountId,
      name: business.name,
      industry: business.industry,
      location: business.city,
      contact_phone: business.phone,
      contact_email: business.email,
      priority: mapPriority(lead.priority),
      source: 'Discovery Intelligence',
      discovery_score: scoreRow?.score ?? null,
      discovery_payload: {
        leadId: lead.id,
        businessId: lead.businessId,
        accountId: lead.accountId,
        website: business.website,
        country: business.country,
        discoveryState: business.discoveryState,
        leadStatus: lead.status,
      },
      notes: [
        business.website ? `Website: ${business.website}` : null,
        business.googleMapsUrl ? `Maps: ${business.googleMapsUrl}` : null,
      ]
        .filter(Boolean)
        .join('\n') || null,
    };

    try {
      const result = await upsertProspect(config, body);
      const prospectId = result.prospect?.id ?? null;
      await db.insert(crmBridgeSync).values({
        direction: 'push_prospect',
        accountId: lead.accountId,
        leadId: lead.id,
        externalKey: discoveryAccountId,
        status: 'ok',
        payload: {
          created: result.created,
          updated: result.updated,
          prospectId,
        },
      });
      await this.crmRepo.addActivity(
        lead.id,
        'crm_push',
        result.created
          ? `Sent to SleeklyBuilt CRM (new prospect #${prospectId ?? '?'})`
          : `Updated SleeklyBuilt CRM prospect #${prospectId ?? '?'}`,
        JSON.stringify({ prospectId, discoveryAccountId }),
      );
      return {
        leadId: lead.id,
        accountId: lead.accountId,
        created: result.created,
        updated: result.updated,
        prospectId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db.insert(crmBridgeSync).values({
        direction: 'push_prospect',
        accountId: lead.accountId,
        leadId: lead.id,
        externalKey: discoveryAccountId,
        status: 'error',
        error: message,
        payload: { body },
      });
      throw err;
    }
  }

  async syncCrmOutcomes(options?: { limit?: number }): Promise<{
    fetched: number;
    upserted: number;
    skipped: number;
  }> {
    const config = await getSleeklyDashConfig();
    if (!config) {
      return { fetched: 0, upserted: 0, skipped: 0 };
    }

    const watermarks = await this.getWatermarks();
    const since = watermarks.outcomesSince;
    const response = await fetchOutcomes(config, {
      since,
      limit: options?.limit ?? 100,
    });
    const rows = response.data ?? [];
    let upserted = 0;
    let skipped = 0;
    let maxClosed: string | null = since;

    for (const row of rows) {
      const applied = await this.upsertOutcome(row);
      if (applied) upserted += 1;
      else skipped += 1;
      const stamp = row.closed_at || row.updated_at || null;
      if (stamp && (!maxClosed || stamp > maxClosed)) maxClosed = stamp;
    }

    await this.setWatermarks({
      ...watermarks,
      outcomesSince: maxClosed ?? watermarks.outcomesSince,
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    });

    return { fetched: rows.length, upserted, skipped };
  }

  async syncInbound(options?: { limit?: number }): Promise<{
    fetched: number;
    created: number;
    skipped: number;
  }> {
    const config = await getSleeklyDashConfig();
    if (!config) {
      return { fetched: 0, created: 0, skipped: 0 };
    }

    const watermarks = await this.getWatermarks();
    const since = watermarks.inboundSince;
    const response = await fetchInbound(config, {
      since,
      limit: options?.limit ?? 50,
    });
    const rows = response.data ?? [];
    let created = 0;
    let skipped = 0;
    let maxSubmitted: string | null = since;

    const db = getDb();
    for (const row of rows) {
      const sourceUrl = `sleekly-dash:${row.request_type}:${row.source_id}`;
      const title =
        row.name?.trim() ||
        row.email?.trim() ||
        `${row.request_type} #${row.source_id}`;
      const snippetParts = [
        row.description?.trim(),
        row.phone ? `Phone: ${row.phone}` : null,
        row.email ? `Email: ${row.email}` : null,
        `Source: sleekly-dash ${row.request_type}`,
      ].filter(Boolean);

      try {
        const result = await this.intentRepo.createDemandUnique({
          source: 'sleekly_dash_inbound',
          signalType: `inbound_${row.request_type}`,
          signalStrength: 70,
          title,
          snippet: snippetParts.join(' · ') || undefined,
          sourceUrl,
        });
        if (result.created) created += 1;
        else skipped += 1;

        await db.insert(crmBridgeSync).values({
          direction: 'pull_inbound',
          externalKey: sourceUrl,
          status: 'ok',
          payload: {
            requestType: row.request_type,
            sourceId: row.source_id,
            created: result.created,
          },
        });
      } catch (err) {
        skipped += 1;
        await db.insert(crmBridgeSync).values({
          direction: 'pull_inbound',
          externalKey: sourceUrl,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }

      const stamp = row.submitted_at || null;
      if (stamp && stamp !== '0000-00-00 00:00:00' && (!maxSubmitted || stamp > maxSubmitted)) {
        maxSubmitted = stamp;
      }
    }

    await this.setWatermarks({
      ...watermarks,
      inboundSince: maxSubmitted ?? watermarks.inboundSince,
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    });

    return { fetched: rows.length, created, skipped };
  }

  async syncAll() {
    const configured = await isSleeklyDashConfigured();
    if (!configured) {
      return {
        configured: false as const,
        message: 'SleeklyBuilt CRM bridge is not configured',
        outcomes: null,
        inbound: null,
      };
    }

    try {
      const outcomes = await this.syncCrmOutcomes();
      const inbound = await this.syncInbound();
      return { configured: true as const, outcomes, inbound, message: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const watermarks = await this.getWatermarks();
      await this.setWatermarks({
        ...watermarks,
        lastSyncAt: new Date().toISOString(),
        lastError: message,
      });
      throw err;
    }
  }

  private async upsertOutcome(row: SleeklyDashOutcomeRow): Promise<boolean> {
    const db = getDb();
    const companyId = Number(row.company_id);
    if (!Number.isFinite(companyId)) return false;

    const discoveryAccountId = row.discovery_account_id?.trim() || null;
    let accountId: string | null = null;
    let leadId: string | null = null;

    if (discoveryAccountId) {
      accountId = discoveryAccountId;
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.accountId, discoveryAccountId))
        .orderBy(desc(leads.updatedAt))
        .limit(1);
      leadId = lead?.id ?? null;
    }

    const closedAt = row.closed_at ? new Date(row.closed_at) : null;
    const services =
      Array.isArray(row.services_sold)
        ? row.services_sold.map(String)
        : row.services_sold ?? null;

    const [existing] = await db
      .select()
      .from(leadOutcomes)
      .where(eq(leadOutcomes.sleeklyDashCompanyId, companyId))
      .limit(1);

    const values = {
      accountId,
      leadId,
      discoveryAccountId,
      outcomeStatus: row.status,
      projectValueUgx: row.project_value_ugx ?? null,
      servicesSold: services,
      lossReason: row.loss_reason ?? null,
      closedAt: closedAt && !Number.isNaN(closedAt.getTime()) ? closedAt : null,
      raw: row as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(leadOutcomes).set(values).where(eq(leadOutcomes.id, existing.id));
    } else {
      await db.insert(leadOutcomes).values({
        sleeklyDashCompanyId: companyId,
        ...values,
      });
    }

    await db.insert(crmBridgeSync).values({
      direction: 'pull_outcome',
      accountId,
      leadId,
      externalKey: String(companyId),
      status: 'ok',
      payload: {
        outcomeStatus: row.status,
        projectValueUgx: row.project_value_ugx ?? null,
      },
    });

    if (leadId) {
      await this.crmRepo.addActivity(
        leadId,
        'crm_outcome',
        `CRM outcome: ${row.status}${
          row.project_value_ugx != null ? ` · UGX ${row.project_value_ugx}` : ''
        }`,
        JSON.stringify({ companyId, status: row.status }),
      );
    }

    return true;
  }

  private async getWatermarks(): Promise<CrmBridgeWatermarks> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(acquisitionSettings)
      .where(eq(acquisitionSettings.key, CRM_BRIDGE_WATERMARK_KEY))
      .limit(1);
    const v = (row?.value ?? {}) as Partial<CrmBridgeWatermarks>;
    return {
      outcomesSince: typeof v.outcomesSince === 'string' ? v.outcomesSince : null,
      inboundSince: typeof v.inboundSince === 'string' ? v.inboundSince : null,
      lastSyncAt: typeof v.lastSyncAt === 'string' ? v.lastSyncAt : null,
      lastError: typeof v.lastError === 'string' ? v.lastError : null,
    };
  }

  private async setWatermarks(value: CrmBridgeWatermarks): Promise<void> {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(acquisitionSettings)
      .where(eq(acquisitionSettings.key, CRM_BRIDGE_WATERMARK_KEY))
      .limit(1);
    if (existing) {
      await db
        .update(acquisitionSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(acquisitionSettings.key, CRM_BRIDGE_WATERMARK_KEY));
    } else {
      await db.insert(acquisitionSettings).values({
        key: CRM_BRIDGE_WATERMARK_KEY,
        value,
      });
    }
  }
}
