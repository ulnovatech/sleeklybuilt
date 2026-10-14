import type { DemandJumpBlock } from '@agency/discovery';

export type DemandJumpResult = {
  jumped: boolean;
  already?: boolean;
  leadId?: string | null;
  memberId?: string;
  reason?: DemandJumpBlock;
};

export function pitchTodayHrefForLead(leadId: string, sellDate?: string) {
  const params = new URLSearchParams({
    pitchToday: '1',
    sort: 'rank',
    direction: 'asc',
    limit: '100',
    selected: leadId,
  });
  if (sellDate) params.set('sellDate', sellDate);
  return `/leads?${params.toString()}`;
}

export const DEMAND_JUMP_REASON_COPY: Record<DemandJumpBlock, string> = {
  cohort_not_frozen: 'Pitch today is not frozen yet — this stays in the Queue until 07:00.',
  no_phone: 'No phone on file, so it cannot jump the frozen 100.',
  no_contact_channel:
    'Phone-only — need a verified email, evidenced social contact, or WhatsApp-ready channel.',
  has_website: 'Owned website — kept off the greenfield morning list.',
  uncertain_website: 'Website status is uncertain — investigate before Pitch today.',
  search_incomplete: 'Website search is incomplete — not confirmed greenfield yet.',
  suppressed: 'Account is suppressed.',
  snoozed: 'Account is snoozed.',
  not_operational: 'Maps status is not operational.',
  already_pitched: 'Already in motion on Pipeline — not added to Pitch today.',
  already_pursued: 'Already has an active pursuit — not added to Pitch today.',
};
