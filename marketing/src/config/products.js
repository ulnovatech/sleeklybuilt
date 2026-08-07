import { FiGlobe, FiLayers, FiPieChart, FiSmartphone } from 'react-icons/fi'
import { siteConfig } from '../site.config'

/**
 * The four product lines, in the order a visitor should meet them: fastest and
 * cheapest first, most involved last. Single source of truth for the landing
 * grid, the search index and the 404 recovery page.
 *
 * `keywords` carry vocabulary visitors type but that never appears on screen —
 * people search "template" though we say layout, and "POS" or "SACCO" rather
 * than "business systems".
 */
export const productLines = [
  {
    id: 'sleek-pages',
    label: 'Sleek Pages',
    tagline: 'Launch in 24 hours from a premium layout',
    href: siteConfig.links.sleekPages,
    badge: 'New',
    icon: FiLayers,
    keywords: [
      'layout',
      'layouts',
      'template',
      'templates',
      'landing page',
      'one page',
      'quick',
      '24 hours',
      'starter',
      'cheap',
    ],
  },
  {
    id: 'websites',
    label: 'Websites',
    tagline: 'Multi-page sites with CMS, blog and gallery',
    href: siteConfig.links.websites,
    icon: FiGlobe,
    keywords: [
      'website',
      'web design',
      'multi page',
      'cms',
      'blog',
      'gallery',
      'services page',
      'ecommerce',
      'online store',
    ],
  },
  {
    id: 'mobile-apps',
    label: 'Mobile Apps',
    tagline: 'Android and iOS apps with mobile money built in',
    href: siteConfig.links.mobileApps,
    icon: FiSmartphone,
    keywords: [
      'app',
      'apps',
      'android',
      'ios',
      'mobile money',
      'momo',
      'airtel',
      'delivery',
      'restaurant',
      'ecommerce app',
    ],
  },
  {
    id: 'business-systems',
    label: 'Business Systems',
    tagline: 'Dashboards, CRM, POS, inventory and automation',
    href: siteConfig.links.businessSystems,
    icon: FiPieChart,
    keywords: [
      'system',
      'systems',
      'dashboard',
      'crm',
      'pos',
      'point of sale',
      'inventory',
      'stock',
      'hr',
      'payroll',
      'invoicing',
      'billing',
      'booking',
      'lms',
      'sacco',
      'school',
      'automation',
      'custom software',
    ],
  },
]
