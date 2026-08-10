export const siteConfig = {
  name: 'SleeklyBuilt',
  tagline: 'Websites, apps & systems — built sleek, built right',
  description:
    'SleeklyBuilt crafts custom websites, mobile apps, graphics, and business systems for clients in Uganda and beyond.',
  email: 'sales@sleeklybuilt.pro',
  location: 'Kampala, Uganda',
  phones: ['+256 791779448', '+256 749594464', '+256 772169960'],
  primaryPhone: '+256791779448',
  whatsapp: 'https://wa.me/256749594464',
  scheduleCall: 'tel:+256791779448',
  /** Marketing hub origin — absolute paths from site root in production */
  homeUrl: import.meta.env.DEV ? 'http://localhost/sleeklybuilt/' : '/',
}

/** Join hub base + path without double slashes. */
export function hubHref(path = '') {
  const base = siteConfig.homeUrl.replace(/\/$/, '')
  const clean = String(path).replace(/^\//, '')
  if (!clean) return base || '/'
  return `${base}/${clean}`
}

/**
 * Projects IA — only routes that exist under /portfolio-app/.
 * Hub destinations are full navigations to the marketing app.
 */
export const projectsNavigation = [
  { id: 'layouts', label: 'Layouts', href: '/', internal: true },
  { id: 'custom', label: 'Custom build', href: '/rainbow', internal: true },
]

export const projectsSecondaryLinks = [
  { id: 'hub-home', label: 'Main site', href: hubHref('') },
  { id: 'hub-prices', label: 'Pricing', href: hubHref('prices') },
  { id: 'hub-track', label: 'Track order', href: hubHref('track-order') },
]

export const projectsFooterExplore = [
  { label: 'Layouts', href: '/', internal: true },
  { label: 'Custom build', href: '/rainbow', internal: true },
  { label: 'Main site', href: hubHref('') },
  { label: 'Pricing', href: hubHref('prices') },
  { label: 'Track order', href: hubHref('track-order') },
  { label: 'Contact', href: hubHref('contact') },
]

export const projectsFooterServices = [
  { label: 'Sleek Pages', href: hubHref('sleek-pages') },
  { label: 'Websites', href: hubHref('websites') },
  { label: 'Mobile Apps', href: hubHref('mobile-apps') },
  { label: 'Business Systems', href: hubHref('business-systems') },
  { label: 'All Products', href: hubHref('products') },
]

export const apiEndpoints = {
  contact: '/php/contactus.php',
  order: `${import.meta.env.VITE_API_URL}/order.php`,
  paymentInit: `${import.meta.env.VITE_API_URL}/payment-init.php`,
  paymentVerify: `${import.meta.env.VITE_API_URL}/payment-verify.php`,
  packages: `${import.meta.env.VITE_API_URL}/packages.php`,
  portfolioDetail: `${import.meta.env.VITE_API_URL}/portfolio-detail.php`,
  portfolios: `${import.meta.env.VITE_API_URL}/portfolios.php?collection=websites`,
}
