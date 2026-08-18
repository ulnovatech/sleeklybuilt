import { FACTORY_MARKETS, type FactoryMarketTier } from '../plans/factory-markets';

export const FACTORY_KEEPER_LIMIT = 100;

export type FactoryGeoTier = FactoryMarketTier | 'other';

export type RankInput = {
  score: number | null;
  reviewCount: number | null;
  hasWhatsAppHint: boolean;
  hasDemand: boolean;
  country: string | null;
};

export function geoTierForCountry(country?: string | null): FactoryGeoTier {
  if (!country?.trim()) return 'other';
  const hit = FACTORY_MARKETS.find((m) => m.country.toLowerCase() === country.trim().toLowerCase());
  return hit?.tier ?? 'other';
}

export function rankScore(input: RankInput): number {
  const tier = geoTierForCountry(input.country);
  let n = (input.score ?? 0) * 10;
  n += Math.min(Math.max(0, input.reviewCount ?? 0), 200);
  if (input.hasWhatsAppHint) n += 80;
  if (input.hasDemand) n += 60;
  if (tier === 'core') n += 40;
  else if (tier === 'explore') n += 20;
  else if (tier === 'probe') n += 5;
  return n;
}

export function cutKeepers<T extends { rankScore: number }>(
  ranked: T[],
  limit = FACTORY_KEEPER_LIMIT,
): { keepers: T[]; remainder: T[] } {
  const ordered = [...ranked].sort((a, b) => b.rankScore - a.rankScore);
  return {
    keepers: ordered.slice(0, Math.max(0, limit)),
    remainder: ordered.slice(Math.max(0, limit)),
  };
}
