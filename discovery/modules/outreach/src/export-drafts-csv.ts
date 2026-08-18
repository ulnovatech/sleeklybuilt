import {
  meetsMinReachability,
  type MinReachabilityLevel,
  type Reachability,
} from '@agency/scoring';
import type { OutreachDraftChannel } from './draft-channel';

export type DraftExportCandidate = {
  leadId: string;
  business: string;
  email: string;
  phone: string;
  mapsUrl: string;
  reachability: Reachability;
  hasContact: boolean;
  suppressed: boolean;
};

export type DraftExportCachedDraft = {
  leadId: string;
  channel: string;
  subject: string | null;
  body: string;
  updatedAt: Date;
};

export type DraftExportAssembleResult = {
  csv: string;
  count: number;
  skippedNoContact: number;
  skippedSuppressed: number;
  skippedReachability: number;
  skippedNoDraft: number;
  exportMode: 'draft';
  channel: OutreachDraftChannel;
};

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Pure CSV assembly for cached LLM drafts.
 * Rows without a draft for the requested channel are skipped (never template-filled).
 */
export function assembleDraftExportCsv(input: {
  channel: OutreachDraftChannel;
  candidates: DraftExportCandidate[];
  draftsByLeadId: Map<string, DraftExportCachedDraft>;
  minReachability?: MinReachabilityLevel;
}): DraftExportAssembleResult {
  const minReachability = input.minReachability ?? 'low';
  const header = [
    'business',
    'email',
    'phone',
    'subject',
    'body',
    'maps_url',
    'draft_channel',
    'draft_generated_at',
  ];
  const lines = [header.join(',')];
  let skippedNoContact = 0;
  let skippedSuppressed = 0;
  let skippedReachability = 0;
  let skippedNoDraft = 0;

  for (const row of input.candidates) {
    if (!row.hasContact) {
      skippedNoContact++;
      continue;
    }
    if (row.suppressed) {
      skippedSuppressed++;
      continue;
    }
    if (!meetsMinReachability(row.reachability, minReachability)) {
      skippedReachability++;
      continue;
    }

    const draft = input.draftsByLeadId.get(row.leadId);
    if (!draft || draft.channel !== input.channel) {
      skippedNoDraft++;
      continue;
    }

    lines.push(
      [
        csvEscape(row.business),
        csvEscape(row.email),
        csvEscape(row.phone),
        csvEscape(draft.subject ?? ''),
        csvEscape(draft.body),
        csvEscape(row.mapsUrl),
        csvEscape(draft.channel),
        csvEscape(draft.updatedAt.toISOString()),
      ].join(','),
    );
  }

  return {
    csv: lines.join('\n'),
    count: lines.length - 1,
    skippedNoContact,
    skippedSuppressed,
    skippedReachability,
    skippedNoDraft,
    exportMode: 'draft',
    channel: input.channel,
  };
}
