import type { PlanFiltersConfig } from './types';

export type CampaignPresence = NonNullable<PlanFiltersConfig['presence']>;

export type DiscoveryCampaign = {
  id: string;
  label: string;
  description: string;
  /** Sure-deal lane — greenfield campaigns stay primary; redesign is separate. */
  presence: CampaignPresence;
  prospectFocus: boolean;
  /** Preferred industries; intersected with settings.discovery.industries at resolve time. */
  industries: string[];
  keywords: string[];
  /** Optional search-angle hints for operators / future query templates. */
  prospectQueryHints: string[];
  suggestedName: (city: string) => string;
};

/**
 * Service-driven discovery campaigns.
 * Greenfield (first site) campaigns default presence=greenfield; redesign stays separate.
 */
export const DISCOVERY_CAMPAIGNS: DiscoveryCampaign[] = [
  {
    id: 'website_build',
    label: 'Website build',
    description: 'Greenfield sure-deals — businesses with weak or no owned website.',
    presence: 'greenfield',
    prospectFocus: true,
    industries: [
      'Restaurant',
      'Salon & Spa',
      'Retail',
      'Healthcare',
      'Dental',
      'Fitness & Gym',
      'Real Estate',
      'Construction',
      'Hospitality',
      'Legal',
      'Accounting',
      'Automotive',
    ],
    keywords: ['no website', 'social only', 'link in bio', 'needs website'],
    prospectQueryHints: [
      '{industry} {city} no website',
      '{industry} {city} Instagram only',
      '{industry} {city} Facebook page',
    ],
    suggestedName: (city) => `${city} Website build`,
  },
  {
    id: 'modernization',
    label: 'Modernization / redesign',
    description: 'Secondary lane — businesses with a site that needs a refresh (not mixed with greenfield).',
    presence: 'redesign',
    prospectFocus: false,
    industries: [
      'Restaurant',
      'Healthcare',
      'Legal',
      'Accounting',
      'Real Estate',
      'Hospitality',
      'Retail',
      'Education',
    ],
    keywords: ['outdated website', 'redesign', 'mobile unfriendly'],
    prospectQueryHints: ['{industry} {city} website', '{industry} {city} official site'],
    suggestedName: (city) => `${city} Modernization`,
  },
  {
    id: 'booking',
    label: 'Online booking',
    description: 'Service businesses that should take appointments online.',
    presence: 'greenfield',
    prospectFocus: true,
    industries: ['Salon & Spa', 'Dental', 'Healthcare', 'Fitness & Gym', 'Veterinary', 'Travel'],
    keywords: ['book appointment', 'no online booking', 'call to book'],
    prospectQueryHints: ['{industry} {city} appointments', '{industry} {city} booking'],
    suggestedName: (city) => `${city} Booking`,
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Retail and product sellers ready for an online shop.',
    presence: 'greenfield',
    prospectFocus: true,
    industries: ['Retail', 'E-commerce', 'Salon & Spa', 'Restaurant'],
    keywords: ['sell online', 'shop', 'no online store'],
    prospectQueryHints: ['{industry} {city} shop', '{industry} {city} products'],
    suggestedName: (city) => `${city} E-commerce`,
  },
  {
    id: 'mobile_app',
    label: 'Mobile app',
    description: 'Businesses that may need a companion app or PWA (still greenfield-first for sites).',
    presence: 'greenfield',
    prospectFocus: true,
    industries: ['Restaurant', 'Retail', 'Fitness & Gym', 'Healthcare', 'Travel', 'E-commerce'],
    keywords: ['mobile app', 'order ahead', 'loyalty app'],
    prospectQueryHints: ['{industry} {city} app', '{industry} {city} mobile order'],
    suggestedName: (city) => `${city} Mobile app`,
  },
  {
    id: 'local_seo',
    label: 'Local SEO',
    description: 'Improve maps/search discoverability — prefer weak presence for first-site upsell.',
    presence: 'greenfield',
    prospectFocus: true,
    industries: [
      'Restaurant',
      'Salon & Spa',
      'Dental',
      'Healthcare',
      'Automotive',
      'Construction',
      'Real Estate',
      'Legal',
    ],
    keywords: ['Google Maps', 'local SEO', 'hard to find'],
    prospectQueryHints: ['{industry} near {city}', '{industry} {city} reviews'],
    suggestedName: (city) => `${city} Local SEO`,
  },
];

export function getDiscoveryCampaign(id: string): DiscoveryCampaign | null {
  return DISCOVERY_CAMPAIGNS.find((c) => c.id === id) ?? null;
}

export function listDiscoveryCampaigns(): DiscoveryCampaign[] {
  return DISCOVERY_CAMPAIGNS;
}
