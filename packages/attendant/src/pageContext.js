/**
 * Page context for attendant — marketing, portfolio, and blog shells.
 * Router pathnames are basename-relative; pass `basePath` to recover the public path.
 */

/** @typedef {'marketing' | 'portfolio' | 'blog'} AttendantHost */

const MARKETING_PATH_TO_PAGE = {
  '/': 'home',
  '/sleek-pages': 'sleek-pages',
  '/websites': 'websites',
  '/mobile-apps': 'mobile-apps',
  '/business-systems': 'business-systems',
  '/products': 'products',
  '/contact': 'contact',
  '/about': 'about',
  '/prices': 'prices',
  '/track-order': 'track-order',
  '/policies': 'policies',
}

const SERVICE_BY_PAGE = {
  'sleek-pages': 'sleek-pages',
  websites: 'websites',
  'mobile-apps': 'mobile-apps',
  'business-systems': 'business-systems',
}

/** Display package ids on /prices (must match pricing.js / pages.json). */
export const DISPLAY_PACKAGE_IDS = new Set([
  'starter',
  'business-basic',
  'standard-growth',
  'pro-ecommerce',
  'ecommerce-app',
  'restaurant-app',
  'sacco-app',
  'school-app',
  'custom-web',
  'custom-app',
])

/**
 * Join SPA basename with router pathname → site-absolute path.
 * @param {string} [basePath] e.g. '/portfolio-app' or '/blog'
 * @param {string} pathname router pathname (basename-relative)
 */
export function publicPath(basePath, pathname) {
  const base = String(basePath || '').replace(/\/$/, '')
  const p = pathname || '/'
  if (!base) return p.startsWith('/') ? p : `/${p}`
  if (p === '/') return `${base}/`
  return `${base}${p.startsWith('/') ? p : `/${p}`}`
}

/**
 * @param {string} pathname public or router path
 * @param {{ host?: AttendantHost, basePath?: string }} [opts]
 */
export function pageIdFromPath(pathname, opts = {}) {
  const host = opts.host || 'marketing'
  const abs = publicPath(opts.basePath, pathname)

  if (host === 'portfolio' || abs.startsWith('/portfolio-app')) {
    if (abs.startsWith('/portfolio-app/order')) return 'portfolio-order'
    return 'portfolio'
  }

  if (host === 'blog' || abs.startsWith('/blog')) {
    const rest = abs.replace(/^\/blog\/?/, '/') || '/'
    if (rest === '/' || rest === '') return 'blog'
    if (rest === '/blog' || rest.startsWith('/blog/')) return 'blog-list'
    if (rest === '/about') return 'blog-about'
    if (rest === '/contact') return 'blog-contact'
    if (rest === '/search' || rest.startsWith('/tags/')) return 'blog'
    if (rest === '/optimizer') return 'blog'
    // Slug posts and unknown blog routes
    return 'blog-post'
  }

  if (abs === '/policies' || abs.startsWith('/policies/')) {
    return 'policies'
  }
  return MARKETING_PATH_TO_PAGE[abs] ?? 'unknown'
}

/**
 * @param {{ pathname: string, search?: string, hash?: string, href?: string }} loc
 * @param {string[]} recentPageIds
 * @param {{ host?: AttendantHost, basePath?: string }} [opts]
 */
export function buildPageContext(loc, recentPageIds = [], opts = {}) {
  const host = opts.host || 'marketing'
  const basePath = opts.basePath || ''
  const routerPath = loc.pathname || '/'
  const pathname = publicPath(basePath, routerPath)
  const pageId = pageIdFromPath(routerPath, { host, basePath })
  const hash = (loc.hash || '').replace(/^#/, '')
  let sectionId = hash || null

  if (pageId === 'policies' && pathname.startsWith('/policies/')) {
    const slug = pathname.slice('/policies/'.length).split('/')[0]
    if (slug) sectionId = slug
  }
  if (pageId === 'blog-post') {
    const slug = routerPath.replace(/^\//, '').split('/')[0]
    if (slug && !['blog', 'about', 'contact', 'search', 'tags', 'optimizer'].includes(slug)) {
      sectionId = slug
    }
  }

  const params = Object.fromEntries(new URLSearchParams(loc.search || ''))
  const query = Object.keys(params).length > 0 ? params : undefined

  let visibleProductId = null
  let visibleProductKind = null
  if (pageId === 'prices' || pageId === 'products') {
    visibleProductKind = 'display_package'
    const fromQuery = params.package || params.plan || params.product || ''
    if (fromQuery && DISPLAY_PACKAGE_IDS.has(fromQuery)) {
      visibleProductId = fromQuery
    } else if (hash && DISPLAY_PACKAGE_IDS.has(hash)) {
      visibleProductId = hash
    }
  }
  if (pageId === 'portfolio' || pageId === 'portfolio-order') {
    visibleProductKind = pageId === 'portfolio-order' ? 'orderable_package' : 'layout'
    const fromQuery = params.package || params.plan || params.product || params.id || ''
    if (fromQuery) visibleProductId = fromQuery
  }

  return {
    current_url: loc.href || `${typeof window !== 'undefined' ? window.location.origin : ''}${pathname}${loc.search || ''}${loc.hash || ''}`,
    page_id: pageId,
    section_id: sectionId,
    path: pathname,
    ...(query ? { query } : {}),
    visible_product_id: visibleProductId,
    visible_product_kind: visibleProductKind,
    visible_service_id: SERVICE_BY_PAGE[pageId] ?? null,
    recent_page_ids: recentPageIds.slice(0, 8),
  }
}
