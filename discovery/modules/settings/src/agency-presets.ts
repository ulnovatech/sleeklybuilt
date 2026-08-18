import type { AgencyPackage, AgencyPresetId, AgencyService, AgencySettings } from './types';

/** Empty catalog = legacy hardcoded BOI/proposal/outreach behavior. */
export function buildGenericAgencyPreset(): AgencySettings {
  return {
    presetId: 'generic',
    brandName: '',
    legalName: '',
    tagline: '',
    currency: 'UGX',
    email: '',
    phone: '',
    location: '',
    senderName: '',
    signature: '',
    packages: [],
    services: [],
  };
}

/**
 * SleeklyBuilt catalog — sourced from marketing site.config.js + php/payments/packages.php
 * (deposit packages). Service rows remap BOI solution rule ids to sellable names.
 */
export function buildSleeklyBuiltAgencyPreset(): AgencySettings {
  const packages: AgencyPackage[] = [
    {
      id: 'basic',
      title: 'Basic Launch Package',
      priceUgx: 250_000,
      depositUgx: 50_000,
      badge: null,
      band: 'starter',
      description: 'Starter website presence for local SMBs',
    },
    {
      id: 'smart',
      title: 'Start Smart Package',
      priceUgx: 400_000,
      depositUgx: 80_000,
      badge: 'popular',
      band: 'growth',
      description: 'Recommended for most small businesses starting online',
    },
    {
      id: 'premium',
      title: 'Premium Growth Package',
      priceUgx: 700_000,
      depositUgx: 140_000,
      badge: 'best-value',
      band: 'premium',
      description: 'Growth package with stronger digital footprint',
    },
  ];

  const services: AgencyService[] = [
    {
      id: 'website_build',
      name: 'Website build (Basic Launch)',
      mapsToSolutionId: 'solution:corporate_website',
      description: 'Owned professional site beyond social or link-in-bio',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business Integration',
      mapsToSolutionId: 'solution:whatsapp_integration',
    },
    {
      id: 'booking',
      name: 'Online Booking System',
      mapsToSolutionId: 'solution:online_booking',
    },
    {
      id: 'lead_capture',
      name: 'Lead Capture & Contact Forms',
      mapsToSolutionId: 'solution:lead_capture',
    },
    {
      id: 'analytics',
      name: 'Analytics & Conversion Tracking',
      mapsToSolutionId: 'solution:analytics',
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Setup',
      mapsToSolutionId: 'solution:ecommerce',
    },
    {
      id: 'mobile_redesign',
      name: 'Mobile-Responsive Redesign',
      mapsToSolutionId: 'solution:mobile_redesign',
    },
    {
      id: 'https',
      name: 'HTTPS & Site Security Upgrade',
      mapsToSolutionId: 'solution:https_modernize',
    },
    {
      id: 'local_seo',
      name: 'Local SEO & Google Maps Optimization',
      mapsToSolutionId: 'solution:local_seo',
    },
  ];

  return {
    presetId: 'sleeklybuilt',
    brandName: 'SleeklyBuilt',
    legalName: 'SleeklyBuilt',
    tagline: 'Websites, apps & systems — built sleek, built right',
    currency: 'UGX',
    email: 'sales@sleeklybuilt.pro',
    phone: '+256 791779448',
    location: 'Kampala, Uganda',
    senderName: 'SleeklyBuilt',
    signature:
      '—\nSleeklyBuilt\nWebsites, apps & systems — built sleek, built right\nsales@sleeklybuilt.pro · +256 791779448\nKampala, Uganda',
    packages,
    services,
  };
}

export function getAgencyPreset(id: AgencyPresetId): AgencySettings {
  if (id === 'sleeklybuilt') return buildSleeklyBuiltAgencyPreset();
  return buildGenericAgencyPreset();
}

export function listAgencyPresets(): Array<{
  id: Exclude<AgencyPresetId, 'custom'>;
  label: string;
  description: string;
}> {
  return [
    {
      id: 'generic',
      label: 'Generic agency',
      description: 'Empty catalog — keep legacy BOI service names and proposal wording.',
    },
    {
      id: 'sleeklybuilt',
      label: 'SleeklyBuilt',
      description: 'Brand, UGX deposit packages, and remapped services from SleeklyBuilt marketing.',
    },
  ];
}

export function agencyHasCatalog(agency: AgencySettings | null | undefined): boolean {
  if (!agency) return false;
  return agency.packages.length > 0 || agency.services.length > 0;
}

export function agencyDisplayName(agency: AgencySettings | null | undefined): string {
  const name = agency?.brandName?.trim();
  return name || 'web agency';
}
