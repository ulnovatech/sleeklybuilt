/**
 * Public marketing SEO route registry (single source for sitemap + usePageSeo).
 * Keep in sync with marketing/src/App.jsx public routes.
 */

export const SITE_URL_DEFAULT = 'https://sleeklybuilt.pro'

/** @typedef {{ path: string, changefreq?: string, priority?: number, title: string, description: string }} SeoRoute */

/** @type {SeoRoute[]} */
export const marketingRoutes = [
  {
    path: '/',
    changefreq: 'weekly',
    priority: 1.0,
    title: 'SleeklyBuilt — Custom Websites, Apps & Systems | Uganda',
    description:
      'Custom websites, mobile apps, and business systems for companies in Uganda and beyond. Clear pricing, live portfolio, and builds you can click through.',
  },
  {
    path: '/about',
    changefreq: 'monthly',
    priority: 0.7,
    title: 'About SleeklyBuilt | Uganda web & systems studio',
    description:
      'Meet SleeklyBuilt — a Kampala-rooted studio building websites, apps, and business systems with clear process and live proof.',
  },
  {
    path: '/prices',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Pricing | SleeklyBuilt websites, apps & systems',
    description:
      'Transparent pricing for SleeklyBuilt websites, layout packages, and custom apps. Get a clear quote for your next build.',
  },
  {
    path: '/contact',
    changefreq: 'monthly',
    priority: 0.9,
    title: "Let's talk | Contact SleeklyBuilt",
    description:
      'Start a project with SleeklyBuilt. Tell us about your website, app, or business system — we reply with a clear next step.',
  },
  {
    path: '/products',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Products | SleeklyBuilt digital offerings',
    description:
      'Explore SleeklyBuilt products — from marketing sites to apps and operations systems tailored to how your business works.',
  },
  {
    path: '/websites',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Custom websites | SleeklyBuilt',
    description:
      'Custom websites built for Ugandan and international businesses — fast, clear, and ready to grow with you.',
  },
  {
    path: '/mobile-apps',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Mobile apps | SleeklyBuilt',
    description:
      'Mobile app development with SleeklyBuilt — practical products for customers and internal teams.',
  },
  {
    path: '/business-systems',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Business systems | SleeklyBuilt',
    description:
      'Custom business systems and dashboards that match how your team actually works — not generic templates.',
  },
  {
    path: '/sleek-pages',
    changefreq: 'monthly',
    priority: 0.7,
    title: 'Sleek Pages | Fast marketing sites by SleeklyBuilt',
    description:
      'Sleek Pages — intentional marketing sites you can launch quickly, then extend as your business grows.',
  },
  {
    path: '/track-order',
    changefreq: 'monthly',
    priority: 0.5,
    title: 'Track your order | SleeklyBuilt',
    description:
      'Check the status of your SleeklyBuilt project or order with your reference details.',
  },
  {
    path: '/policies',
    changefreq: 'yearly',
    priority: 0.4,
    title: 'Policies | SleeklyBuilt',
    description:
      'SleeklyBuilt public policies — privacy, terms, and how we handle your information.',
  },
  {
    path: '/policies/terms',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Terms of Service | SleeklyBuilt',
    description: 'SleeklyBuilt terms of service for websites, apps, and related work.',
  },
  {
    path: '/policies/privacy',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Privacy Policy | SleeklyBuilt',
    description: 'How SleeklyBuilt collects, uses, and protects personal information.',
  },
  {
    path: '/policies/payment',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Payment Policy | SleeklyBuilt',
    description: 'Deposits, invoices, and accepted payment methods for SleeklyBuilt projects.',
  },
  {
    path: '/policies/refund',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Refund & Cancellation | SleeklyBuilt',
    description: 'Refund and cancellation terms for SleeklyBuilt engagements.',
  },
  {
    path: '/policies/delivery',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Delivery Policy | SleeklyBuilt',
    description: 'How SleeklyBuilt delivers milestones, previews, and final assets.',
  },
  {
    path: '/policies/revisions',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Revisions Policy | SleeklyBuilt',
    description: 'Included revision rounds and change-request process at SleeklyBuilt.',
  },
  {
    path: '/policies/support',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Support Policy | SleeklyBuilt',
    description: 'Post-launch support channels and response expectations at SleeklyBuilt.',
  },
  {
    path: '/policies/ip',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Intellectual Property | SleeklyBuilt',
    description: 'Ownership of designs, code, and content created by SleeklyBuilt.',
  },
  {
    path: '/policies/hosting',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'Hosting Policy | SleeklyBuilt',
    description: 'Hosting, domains, and uptime expectations for SleeklyBuilt-managed sites.',
  },
  {
    path: '/policies/ai-attendant',
    changefreq: 'yearly',
    priority: 0.3,
    title: 'AI Attendant Policy | SleeklyBuilt',
    description: 'How the SleeklyBuilt AI attendant works, what it stores, and when humans take over.',
  },
]

/** Static public surfaces outside the marketing SPA router */
export const staticPublicPaths = [
  { path: '/portfolio-app/', changefreq: 'weekly', priority: 0.9 },
  { path: '/blog/', changefreq: 'weekly', priority: 0.8 },
  { path: '/blog/about', changefreq: 'monthly', priority: 0.5 },
  { path: '/blog/contact', changefreq: 'monthly', priority: 0.5 },
]

export const robotsDisallow = [
  '/dash/',
  '/sleekly-dash/',
  '/api/',
  '/blog/admin/',
  '/performante',
  '/performante/',
]

export function normalizeSeoPath(pathname) {
  if (!pathname || pathname === '/') return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed || '/'
}

/** @returns {SeoRoute | undefined} */
export function getMarketingSeoRoute(pathname) {
  const key = normalizeSeoPath(pathname)
  return marketingRoutes.find((route) => normalizeSeoPath(route.path) === key)
}
