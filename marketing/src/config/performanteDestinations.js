/**
 * Operator destinations for the hidden /performante bridge.
 * Imported only by PerformanteDestinations (post-allowlist lazy chunk).
 * Not linked from public nav, sitemap, or search.
 *
 * All destinations use full page navigation (<a>) because they leave the
 * marketing SPA (or reload home intentionally).
 */

const discoveryUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DISCOVERY_URL?.replace(/\/$/, '')) ||
  'https://discovery.sleeklybuilt.pro'

/** @typedef {{ id: string, label: string, href: string, description: string, external?: boolean }} PerformanteDestination */

/** @type {PerformanteDestination[]} */
export const performanteDestinations = [
  {
    id: 'dash',
    label: 'CRM / Dash',
    href: '/dash/',
    description: 'Leads, companies, requests, settings',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    href: discoveryUrl,
    description: 'Demand Capture — research & outreach',
    external: true,
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '/blog/',
    description: 'Public posts',
  },
  {
    id: 'blog-admin',
    label: 'Blog admin',
    href: '/blog/admin/',
    description: 'Write and manage posts',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: '/portfolio-app/',
    description: 'Template gallery',
  },
  {
    id: 'marketing',
    label: 'Marketing home',
    href: '/',
    description: 'Public hub',
  },
]
