import type { OpportunityType } from './opportunity-brief';

/**
 * The primary acquisition lane targets businesses that need their first real
 * web presence. Existing sites remain visible in a separate redesign lane.
 */
export type AcquisitionLane = 'greenfield' | 'redesign';

export function deriveAcquisitionLane(input: {
  hasRealWebsite: boolean;
  opportunityType: OpportunityType;
}): AcquisitionLane {
  if (!input.hasRealWebsite) return 'greenfield';
  if (input.opportunityType === 'greenfield') return 'greenfield';
  return 'redesign';
}
