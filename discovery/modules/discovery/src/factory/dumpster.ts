import { FACTORY_MISS_REASONS, type FactoryMissReason } from './miss-reasons';

/** Dumpster rows that may compete again on a later night. Bench, not grave. */
export const BENCH_MISS_REASONS: FactoryMissReason[] = ['over_cut', 'no_phone'];

export const DUMPSTER_OPS = [
  'restore',
  'pitch_anyway',
  'snooze',
  'suppress',
  'mark_has_website',
] as const;

export type DumpsterOp = (typeof DUMPSTER_OPS)[number];

export const FACTORY_MISS_REASON_LABELS: Record<FactoryMissReason, string> = {
  over_cut: 'Over the 100',
  no_phone: 'No phone',
  has_website: 'Real website',
  already_pursued: 'Already pursued',
  not_operational: 'Closed / not operational',
  suppressed: 'Suppressed',
  snoozed: 'Snoozed',
};

export function isBenchEligible(missReason?: string | null): boolean {
  return BENCH_MISS_REASONS.includes(missReason as FactoryMissReason);
}

export function dumpsterReasonLabel(reason?: string | null): string {
  if (reason && FACTORY_MISS_REASONS.includes(reason as FactoryMissReason)) {
    return FACTORY_MISS_REASON_LABELS[reason as FactoryMissReason];
  }
  return 'Unknown';
}

/** Suggested primary ops for a miss reason — all ops remain available. */
export function suggestedDumpsterOps(reason?: string | null): DumpsterOp[] {
  switch (reason) {
    case 'over_cut':
      return ['restore', 'pitch_anyway', 'snooze'];
    case 'no_phone':
      return ['snooze', 'pitch_anyway'];
    case 'has_website':
      return ['mark_has_website', 'suppress'];
    case 'not_operational':
      return ['suppress'];
    case 'already_pursued':
      return [];
    case 'suppressed':
      return ['restore'];
    case 'snoozed':
      return ['restore'];
    default:
      return ['restore', 'snooze'];
  }
}
