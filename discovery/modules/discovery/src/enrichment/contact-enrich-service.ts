/**
 * contact_enrich stage — recover public contact channels without requiring a crawlable website.
 * Never invents emails or claims untested WhatsApp readiness.
 */

import { AccountRepository } from '@agency/accounts';
import { getDb, accounts, businesses } from '@agency/database';
import { logger } from '@agency/config';
import { platformSettings } from '@agency/settings';
import { eq } from 'drizzle-orm';
import {
  mergeProspectProofIntoMetadata,
  readProspectProof,
  type ContactChannelEvidence,
  type ProspectProof,
  emptyProspectProof,
} from '../lib/prospect-evidence';
import { SearchApiClient } from '../providers/search-api-client';
import { classifySearchResult } from '../providers/search-result-classifier';
import type { SearchResultItem } from '../providers/parse-search-results';

export type ContactEnrichSearchFn = (
  query: string,
  opts: { maxPages: number; country: string },
) => Promise<{ items: SearchResultItem[] }>;

export type ContactEnrichRunResult = {
  attempted: number;
  updated: number;
  phonesAdded: number;
  emailsAdded: number;
  socialsAdded: number;
  skippedUnconfigured: number;
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?256|0)?7\d{8}|\+\d{10,15}/g;
const WA_RE = /(?:wa\.me\/|whatsapp\.com\/send\?phone=)(\+?\d{8,15})/i;

const DEFAULT_MAX = 80;

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 9) return null;
  if (digits.startsWith('256') && digits.length >= 12) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith('0') && digits.length >= 10) return `+256${digits.slice(1, 10)}`;
  if (digits.length === 9 && digits.startsWith('7')) return `+256${digits}`;
  if (raw.trim().startsWith('+') && digits.length >= 10) return `+${digits}`;
  return null;
}

function extractEmails(text: string): string[] {
  const found = text.match(EMAIL_RE) ?? [];
  return [...new Set(found.map((e) => e.toLowerCase()))].filter(
    (e) => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.includes('example.com'),
  );
}

function extractPhones(text: string): string[] {
  const found = text.match(PHONE_RE) ?? [];
  const out: string[] = [];
  for (const f of found) {
    const n = normalizePhone(f);
    if (n) out.push(n);
  }
  return [...new Set(out)];
}

export class ContactEnrichService {
  private accountRepo = new AccountRepository();
  private client = new SearchApiClient({ logContext: 'contact_enrich', braveOperation: 'search' });

  constructor(private readonly searchFn?: ContactEnrichSearchFn) {}

  async enrichForRun(
    runId: string,
    opts?: { maxCandidates?: number },
  ): Promise<ContactEnrichRunResult> {
    await platformSettings.ensureLoaded();
    const maxCandidates = opts?.maxCandidates ?? DEFAULT_MAX;
    const rows = await this.loadRunCandidates(runId, maxCandidates);
    const result: ContactEnrichRunResult = {
      attempted: 0,
      updated: 0,
      phonesAdded: 0,
      emailsAdded: 0,
      socialsAdded: 0,
      skippedUnconfigured: 0,
    };

    const configured = this.searchFn ? true : this.client.isConfigured();

    for (const row of rows) {
      result.attempted++;
      const priorProof = readProspectProof(row.metadata) ?? emptyProspectProof();
      const contacts: ContactChannelEvidence[] = [...(priorProof.contacts ?? [])];
      const observedAt = new Date().toISOString();

      // Seed from existing account fields (provenance: account).
      if (row.phone?.trim()) {
        this.upsertContact(contacts, {
          channel: 'phone',
          value: row.phone.trim(),
          source: 'account',
          observedAt,
          verified: true,
          identityMatch: 'exact',
        });
      }
      if (row.email?.trim()) {
        this.upsertContact(contacts, {
          channel: 'email',
          value: row.email.trim().toLowerCase(),
          source: 'account',
          observedAt,
          verified: true,
          identityMatch: 'exact',
        });
      }
      for (const [channel, value] of [
        ['facebook', row.facebookUrl],
        ['instagram', row.instagramUrl],
      ] as const) {
        if (value?.trim()) {
          this.upsertContact(contacts, {
            channel,
            value: value.trim(),
            source: 'account',
            observedAt,
            verified: true,
            identityMatch: 'likely',
          });
        }
      }

      let phoneAdded = false;
      let emailAdded = false;
      let socialAdded = false;

      if (configured) {
        const queries = this.buildContactQueries(row);
        for (const query of queries) {
          try {
            const search = this.searchFn
              ? await this.searchFn(query, { maxPages: 1, country: row.country || 'Uganda' })
              : await this.client.searchQuery(query, {
                  maxPages: 1,
                  country: row.country || 'Uganda',
                });
            for (const item of search.items.slice(0, 6)) {
              const text = `${item.title ?? ''} ${item.snippet ?? ''} ${item.link ?? ''}`;
              for (const email of extractEmails(text)) {
                const before = contacts.length;
                this.upsertContact(contacts, {
                  channel: 'email',
                  value: email,
                  source: 'public_search',
                  observedAt,
                  verified: true,
                  identityMatch: 'likely',
                });
                if (contacts.length > before) emailAdded = true;
              }
              for (const phone of extractPhones(text)) {
                const before = contacts.length;
                this.upsertContact(contacts, {
                  channel: 'phone',
                  value: phone,
                  source: 'public_search',
                  observedAt,
                  verified: true,
                  identityMatch: 'likely',
                });
                if (contacts.length > before) phoneAdded = true;
              }
              const wa = text.match(WA_RE);
              if (wa?.[1]) {
                const phone = normalizePhone(wa[1]);
                if (phone) {
                  const before = contacts.length;
                  this.upsertContact(contacts, {
                    channel: 'whatsapp',
                    value: phone,
                    source: 'public_search_wa_link',
                    observedAt,
                    verified: true,
                    identityMatch: 'likely',
                  });
                  if (contacts.length > before) socialAdded = true;
                }
              }
              const kind = classifySearchResult(item.link, item.title ?? '', item.snippet);
              if (kind.kind === 'social_profile' && kind.platform) {
                const channel =
                  kind.platform === 'facebook'
                    ? 'facebook'
                    : kind.platform === 'instagram'
                      ? 'instagram'
                      : kind.platform === 'youtube'
                        ? 'youtube'
                        : 'other_social';
                const before = contacts.length;
                this.upsertContact(contacts, {
                  channel,
                  value: item.link,
                  source: 'public_search',
                  observedAt,
                  verified: true,
                  identityMatch: 'likely',
                });
                if (contacts.length > before) socialAdded = true;
              }
            }
          } catch (err) {
            logger.warn('contact_enrich query failed', {
              runId,
              accountId: row.accountId,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      } else {
        result.skippedUnconfigured++;
      }

      const nextPhone =
        row.phone?.trim() ||
        contacts.find((c) => c.channel === 'phone')?.value ||
        null;
      const nextEmail =
        row.email?.trim() ||
        contacts.find((c) => c.channel === 'email')?.value ||
        null;
      const nextFb =
        row.facebookUrl?.trim() ||
        contacts.find((c) => c.channel === 'facebook')?.value ||
        null;
      const nextIg =
        row.instagramUrl?.trim() ||
        contacts.find((c) => c.channel === 'instagram')?.value ||
        null;

      const proof: ProspectProof = {
        ...priorProof,
        contacts,
        contactEnrichedAt: observedAt,
      };

      const metadata = mergeProspectProofIntoMetadata(row.metadata, proof);
      await this.accountRepo.update(row.accountId, {
        metadata,
        phone: nextPhone ?? undefined,
        email: nextEmail ?? undefined,
        facebookUrl: nextFb ?? undefined,
        instagramUrl: nextIg ?? undefined,
      });

      if (phoneAdded) result.phonesAdded++;
      if (emailAdded) result.emailsAdded++;
      if (socialAdded) result.socialsAdded++;
      result.updated++;
    }

    logger.info('contact_enrich complete', { runId, ...result });
    return result;
  }

  private upsertContact(list: ContactChannelEvidence[], next: ContactChannelEvidence) {
    const idx = list.findIndex(
      (c) => c.channel === next.channel && c.value.toLowerCase() === next.value.toLowerCase(),
    );
    if (idx >= 0) {
      const prev = list[idx]!;
      // Never replace verified with unverified.
      if (prev.verified && !next.verified) return;
      list[idx] = { ...prev, ...next, verified: prev.verified || next.verified };
      return;
    }
    list.push(next);
  }

  private buildContactQueries(row: {
    name: string;
    city: string | null;
    country: string | null;
    phone: string | null;
  }): string[] {
    const name = row.name.trim();
    const city = row.city?.trim();
    const queries: string[] = [];
    if (name && city) {
      queries.push(`"${name}" "${city}" (email OR phone OR contact OR WhatsApp)`);
      queries.push(`"${name}" "${city}" Facebook OR Instagram`);
    } else if (name) {
      queries.push(`"${name}" contact email phone`);
    }
    if (name && row.phone?.trim()) {
      queries.push(`"${name}" ${row.phone.trim()}`);
    }
    return queries.slice(0, 2);
  }

  private async loadRunCandidates(runId: string, limit: number) {
    const db = getDb();
    const rows = await db
      .select({
        accountId: accounts.id,
        name: accounts.canonicalName,
        phone: accounts.phone,
        email: accounts.email,
        city: accounts.city,
        country: accounts.country,
        facebookUrl: accounts.facebookUrl,
        instagramUrl: accounts.instagramUrl,
        metadata: accounts.metadata,
      })
      .from(businesses)
      .innerJoin(accounts, eq(businesses.accountId, accounts.id))
      .where(eq(businesses.discoveryRunId, runId))
      .limit(limit * 2);

    const seen = new Set<string>();
    const out: typeof rows = [];
    for (const row of rows) {
      if (seen.has(row.accountId)) continue;
      seen.add(row.accountId);
      out.push(row);
      if (out.length >= limit) break;
    }
    return out;
  }
}
