/** Map marketing routes to attendant page_id (schemas/context.json). */
const PATH_TO_PAGE = {
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
 * @param {string} pathname
 */
export function pageIdFromPath(pathname) {
  if (pathname === '/policies' || pathname.startsWith('/policies/')) {
    return 'policies'
  }
  return PATH_TO_PAGE[pathname] ?? 'unknown'
}

/**
 * @param {{ pathname: string, search?: string, hash?: string, href?: string }} loc
 * @param {string[]} recentPageIds
 */
export function buildPageContext(loc, recentPageIds = []) {
  const pathname = loc.pathname || '/'
  const pageId = pageIdFromPath(pathname)
  const hash = (loc.hash || '').replace(/^#/, '')
  let sectionId = hash || null
  if (pageId === 'policies' && pathname.startsWith('/policies/')) {
    const slug = pathname.slice('/policies/'.length).split('/')[0]
    if (slug) {
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

  return {
    current_url: loc.href || `${window.location.origin}${pathname}${loc.search || ''}${loc.hash || ''}`,
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
