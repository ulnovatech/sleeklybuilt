export type DiscoveryState = 'new' | 'known_fresh' | 'known_stale';

export type DiscoveryStateAccountAnchor = {
  lastCrawledAt?: Date | string | null;
  lastEnrichedAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

function toTime(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Classify a resolved account for incremental discovery.
 * - new: first time we see this account
 * - known_fresh: seen before and enriched/crawled within staleAfterDays
 * - known_stale: seen before but enrichment is older than staleAfterDays (or never enriched)
 */
export function classifyDiscoveryState(input: {
  created: boolean;
  account: DiscoveryStateAccountAnchor;
  staleAfterDays: number;
  now?: Date;
}): DiscoveryState {
  if (input.created) return 'new';

  const nowMs = (input.now ?? new Date()).getTime();
  const staleMs = Math.max(1, input.staleAfterDays) * 24 * 60 * 60 * 1000;
  const anchor =
    toTime(input.account.lastCrawledAt) ??
    toTime(input.account.lastEnrichedAt) ??
    toTime(input.account.updatedAt);

  if (anchor == null) return 'known_stale';
  if (nowMs - anchor > staleMs) return 'known_stale';
  return 'known_fresh';
}

export function isKnownFresh(state: string | null | undefined): boolean {
  return state === 'known_fresh';
}
