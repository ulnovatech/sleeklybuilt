import { siteConfig } from '../site.config'
import { productLines } from './products'
import { productCatalogSearchEntries } from './productCatalog'

/**
 * Static half of the search index. Layout results are fetched live from the
 * published catalog — see CommandPalette.
 */
export const productEntries = [
  ...productLines.map((line) => ({
    id: line.id,
    label: line.label,
    description: line.tagline,
    href: line.href,
    keywords: line.keywords,
  })),
  ...productCatalogSearchEntries,
]

export const pageEntries = [
  {
    id: 'home',
    label: 'Home',
    description: 'What we build and how we work',
    href: siteConfig.links.home,
    keywords: ['start', 'overview', 'landing'],
  },
  {
    id: 'products',
    label: 'All Products',
    description: 'Everything you need to launch and grow',
    href: siteConfig.links.products,
    keywords: ['services', 'all services', 'catalogue', 'catalog', 'everything', 'more services'],
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Browse published work with live previews',
    href: siteConfig.links.portfolio,
    keywords: ['portfolio', 'work', 'gallery', 'previews', 'examples', 'case studies'],
  },
  {
    id: 'prices',
    label: 'Pricing',
    description: 'Packages and what each one includes',
    href: siteConfig.links.prices,
    keywords: ['price', 'pricing', 'cost', 'how much', 'packages', 'quote', 'budget', 'ugx'],
  },
  {
    id: 'contact',
    label: 'Contact',
    description: "Tell us what you're looking for",
    href: siteConfig.links.contact,
    keywords: ['contact', 'talk', 'email', 'phone', 'whatsapp', 'enquiry', 'inquiry', 'get in touch', 'hire'],
  },
  {
    id: 'about',
    label: 'About',
    description: 'Who we are and how we operate',
    href: siteConfig.links.about,
    keywords: ['about', 'team', 'company', 'who', 'story'],
  },
  {
    id: 'track-order',
    label: 'Track order',
    description: 'Check the status of an existing order',
    href: siteConfig.links.trackOrder,
    keywords: ['track', 'order', 'status', 'reference', 'payment', 'deposit'],
  },
]
