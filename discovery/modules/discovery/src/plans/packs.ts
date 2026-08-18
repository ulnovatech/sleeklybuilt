/**
 * Industry packs — curated multi-industry sets intersected with settings.discovery.industries.
 */
export type DiscoveryPack = {
  id: string;
  label: string;
  description: string;
  /** Preferred industry labels (must match discovery industry vocabulary). */
  industries: string[];
};

export const DISCOVERY_PACKS: DiscoveryPack[] = [
  {
    id: 'local_commerce',
    label: 'Local Commerce',
    description: 'Restaurants, retail, salons, and online sellers.',
    industries: ['Restaurant', 'Retail', 'Salon & Spa', 'E-commerce'],
  },
  {
    id: 'health',
    label: 'Health',
    description: 'Clinics, dental, veterinary, and fitness.',
    industries: ['Healthcare', 'Dental', 'Veterinary', 'Fitness & Gym'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    description: 'Hotels, travel, and dining.',
    industries: ['Hospitality', 'Travel', 'Restaurant'],
  },
  {
    id: 'professional_services',
    label: 'Professional Services',
    description: 'Legal, accounting, agencies, and tech.',
    industries: ['Accounting', 'Legal', 'Marketing Agency', 'Technology', 'Web Development', 'Education'],
  },
  {
    id: 'trades',
    label: 'Trades',
    description: 'Construction, automotive, and property.',
    industries: ['Construction', 'Automotive', 'Real Estate'],
  },
];

export function getDiscoveryPack(id: string): DiscoveryPack | null {
  return DISCOVERY_PACKS.find((p) => p.id === id) ?? null;
}

export function listDiscoveryPacks(): DiscoveryPack[] {
  return DISCOVERY_PACKS;
}

/** Case-insensitive intersection preserving order of `preferred`. */
export function intersectIndustries(preferred: string[], available: string[]): string[] {
  const avail = new Map(available.map((i) => [i.trim().toLowerCase(), i.trim()]));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of preferred) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    const match = avail.get(key);
    if (!match) continue;
    seen.add(key);
    out.push(match);
  }
  return out;
}

export function resolvePackIndustries(packId: string, availableIndustries: string[]): string[] {
  const pack = getDiscoveryPack(packId);
  if (!pack) return [];
  return intersectIndustries(pack.industries, availableIndustries);
}
