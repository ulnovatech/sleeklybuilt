/**
 * SleeklyBuilt CRM dashboard — external app links and env-driven URLs.
 */

const isDev = import.meta.env.DEV

export const siteConfig = {
  name: 'SleeklyBuilt',
  tagline: 'Sleekly Dash',
}

/** Federated apps opened from the sidebar (not in-app routes). */
export const appLinks = {
  homeSite: import.meta.env.VITE_HOME_SITE_URL || (isDev ? 'http://localhost/sleeklybuilt/' : '/'),
  blog: import.meta.env.VITE_BLOG_URL || (isDev ? 'http://localhost:5173' : '/blog/'),
  portfolio:
    import.meta.env.VITE_PORTFOLIO_URL ||
    (isDev ? 'http://localhost/sleeklybuilt/portfolio/' : '/portfolio-app/'),
  discoveryIntelligence:
    import.meta.env.VITE_DISCOVERY_URL ||
    (isDev ? 'http://localhost:3000' : 'http://discovery.34.66.94.12.nip.io'),
}
