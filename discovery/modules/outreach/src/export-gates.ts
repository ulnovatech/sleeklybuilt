export const DEFAULT_EXPORT_STATUSES = ['REVIEWED', 'CONTACTED'] as const;

/** Pursuits eligible for the Active Outreach Queue (excludes NEW and terminal stages). */
export const DEFAULT_OUTREACH_QUEUE_STATUSES = [
  'REVIEWED',
  'QUALIFIED',
  'CONTACTED',
  'REPLIED',
  'NO_RESPONSE',
] as const;

export type OutreachQueueStatus = (typeof DEFAULT_OUTREACH_QUEUE_STATUSES)[number];

export function resolveExportStatuses(includeUnreviewed: boolean): string[] {
  if (includeUnreviewed) {
    return ['NEW', ...DEFAULT_EXPORT_STATUSES];
  }
  return [...DEFAULT_EXPORT_STATUSES];
}

export function resolveOutreachQueueStatuses(status?: string): string[] {
  if (status?.trim()) return [status.trim()];
  return [...DEFAULT_OUTREACH_QUEUE_STATUSES];
}

export function hasContactPath(email?: string | null, phone?: string | null): boolean {
  return !!(email?.trim() || phone?.trim());
}

/** Export eligibility — Places ID alone is never enough. */
export function assertExportContactGate(input: {
  email?: string | null;
  phone?: string | null;
}): { allowed: boolean; reason?: string } {
  if (hasContactPath(input.email, input.phone)) return { allowed: true };
  return { allowed: false, reason: 'Export requires a usable phone or email.' };
}
