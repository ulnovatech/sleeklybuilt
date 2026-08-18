import { api } from '@/lib/api';

export type PitchSessionRow = {
  lead: { id: string; status: string };
  factory?: { rank: number | null; recommendedChannel: string | null; memberId: string };
};

type LeadsListResponse = {
  items: PitchSessionRow[];
  total: number;
};

const UNPITCHED_STATUSES = new Set(['NEW', 'REVIEWED']);

export function isUnpitchedStatus(status: string): boolean {
  return UNPITCHED_STATUSES.has(status);
}

export async function fetchUnpitchedKeepers(sellDate?: string): Promise<PitchSessionRow[]> {
  const params = new URLSearchParams({
    pitchToday: '1',
    sort: 'rank',
    direction: 'asc',
    limit: '100',
    unpitched: '1',
  });
  if (sellDate) params.set('sellDate', sellDate);
  const data = await api<LeadsListResponse>(`/api/crm/leads?${params.toString()}`);
  return data.items ?? [];
}

export function nextUnpitchedLeadId(
  unpitched: PitchSessionRow[],
  currentLeadId: string,
  currentRank?: number | null,
): string | null {
  if (!unpitched.length) return null;
  const rank =
    currentRank ??
    unpitched.find((row) => row.lead.id === currentLeadId)?.factory?.rank ??
    0;
  const after = unpitched.find((row) => (row.factory?.rank ?? 0) > (rank ?? 0));
  if (after) return after.lead.id;
  const fallback = unpitched.find((row) => row.lead.id !== currentLeadId);
  return fallback?.lead.id ?? null;
}

export function prevKeeperInList(items: PitchSessionRow[], currentLeadId: string): string | null {
  const idx = items.findIndex((row) => row.lead.id === currentLeadId);
  if (idx <= 0) return null;
  return items[idx - 1]?.lead.id ?? null;
}

export function nextKeeperInList(items: PitchSessionRow[], currentLeadId: string): string | null {
  const idx = items.findIndex((row) => row.lead.id === currentLeadId);
  if (idx < 0 || idx >= items.length - 1) return null;
  return items[idx + 1]?.lead.id ?? null;
}
