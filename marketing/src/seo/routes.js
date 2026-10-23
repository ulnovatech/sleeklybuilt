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
    title: 'UGX pricing | SleeklyBuilt websites & apps',
    description:
      'Published UGX packages for websites and Sleek Pages, plus clear quotes for apps and systems. See what you pay before you start.',
  },
  {
    path: '/contact',
    changefreq: 'monthly',
    priority: 0.9,
    title: 'Contact SleeklyBuilt | Form, WhatsApp or call',
    description:
      'Start a website, Sleek Page, app, or system project. Reach us by form, WhatsApp, or phone — reply within one working day.',
  },
  {
    path: '/products',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Products | Sleek Pages, websites, apps & systems',
    description:
      'Browse SleeklyBuilt offerings by need — fast Sleek Pages, multi-page websites, mobile apps, and business systems.',
  },
  {
    path: '/products/attendant',
    changefreq: 'monthly',
    priority: 0.85,
    title: 'Sleekly Attendant — AI attendant for your website | SleeklyBuilt',
    description:
      'Give every visitor a clearer path to becoming your customer. Sleekly Attendant answers questions, guides people through your site, and captures enquiries — set up with you for UGX 49,000/month in Uganda or US$12/month internationally.',
  },
  {
    path: '/websites',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Custom websites in Uganda | SleeklyBuilt Kampala',
    description:
      'Custom websites for businesses in Uganda and across Africa — WhatsApp-ready, mobile-first, with clear UGX packages.',
  },
  {
    path: '/mobile-apps',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Mobile apps | SleeklyBuilt Uganda',
    description:
      'Practical mobile apps for customers and teams — scoped with a clear quote before build starts.',
  },
  {
    path: '/business-systems',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Business systems | SleeklyBuilt',
    description:
      'Custom business systems and dashboards that match how your team works — inventory, booking, ops, and more.',
  },
  {
    path: '/sleek-pages',
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Sleek Pages | Go live fast | SleeklyBuilt',
    description:
      'Premium compact site layouts personalised for your brand — often live within about a day once content is ready.',
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
