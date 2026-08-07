/** Public site URL — interim nip.io host until custom domain is live */
export const siteUrl =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || 'http://hub.34.66.94.12.nip.io'

export const siteConfig = {
  name: 'SleeklyBuilt',
  legalName: 'SleeklyBuilt',
  tagline: 'Websites, apps & systems — built sleek, built right',
  description:
    'SleeklyBuilt crafts custom websites, mobile apps, graphics, and business systems for clients in Uganda and beyond.',
  email: 'ulnovatech@gmail.com',
  location: 'Kampala, Uganda',
  addressNote: 'Office under development',
  phones: ['+256 791779448', '+256 749594464', '+256 772169960'],
  primaryPhone: '+256791779448',
  whatsapp: 'https://wa.me/256749594464',
  social: {
    x: 'https://x.com/ulnova26716',
    instagram: 'https://www.instagram.com/ulnovatech/?hl=en',
    linkedin: 'https://www.linkedin.com/in/ulnova-tech-394547376/',
    youtube: 'https://www.youtube.com/@UlnovaTech',
  },
  links: {
    home: '/',
    sleekPages: '/sleek-pages',
    websites: '/websites',
    mobileApps: '/mobile-apps',
    businessSystems: '/business-systems',
    products: '/products',
    contact: '/contact',
    portfolio: '/portfolio-app/',
    about: '/about',
    prices: '/prices',
    trackOrder: '/track-order',
    getStarted: '/contact',
    logo: '/assets/img/uln-logo.png',
  },
  siteUrl,
}

const portfolioApi =
  import.meta.env.VITE_PORTFOLIO_API_URL ||
  (import.meta.env.DEV ? 'http://localhost/ulnovatech/portfolio/api' : '/portfolio/api')

export const apiEndpoints = {
  contact: '/php/contactus.php',
  newsletter: '/php/newsletter.php',
  webDesign: '/php/webdesigninq.php',
  appDev: '/php/appdevrequests.php',
  graphics: '/php/graphdesrequests.php',
  marketing: '/php/marketingrequests.php',
  orderStatus: `${portfolioApi}/order-status.php`,
  /** Published layout catalog — accepts ?collection=websites|sleek-pages */
  layouts: `${portfolioApi}/portfolios.php`,
}

/**
 * Primary navigation. Deliberately flat — five destinations, no dropdowns.
 * The old three-level "All Products" menu ended in hash links that all resolved
 * back to the homepage, which taught visitors that clicking does nothing.
 */
export const mainNavigation = [
  { id: 'sleek-pages', label: 'Sleek Pages', href: siteConfig.links.sleekPages, badge: 'New' },
  { id: 'websites', label: 'Websites', href: siteConfig.links.websites },
  { id: 'mobile-apps', label: 'Mobile Apps', href: siteConfig.links.mobileApps },
  { id: 'products', label: 'All Products', href: siteConfig.links.products },
  { id: 'projects', label: 'Projects', href: siteConfig.links.portfolio },
]

export const footerUsefulLinks = [
  { label: 'Home', href: siteConfig.links.home },
  { label: 'About us', href: siteConfig.links.about },
  { label: 'Pricing', href: siteConfig.links.prices },
  { label: 'Track order', href: siteConfig.links.trackOrder },
  { label: 'Projects', href: siteConfig.links.portfolio },
  { label: 'Contact', href: siteConfig.links.contact },
]

export const footerServiceLinks = [
  { label: 'Sleek Pages', href: siteConfig.links.sleekPages },
  { label: 'Websites', href: siteConfig.links.websites },
  { label: 'Mobile Apps', href: siteConfig.links.mobileApps },
  { label: 'Business Systems', href: siteConfig.links.businessSystems },
  { label: 'All Products', href: siteConfig.links.products },
]
