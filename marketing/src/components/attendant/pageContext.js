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
}

const SERVICE_BY_PAGE = {
  'sleek-pages': 'sleek-pages',
  websites: 'websites',
  'mobile-apps': 'mobile-apps',
  'business-systems': 'business-systems',
}

/**
 * @param {{ pathname: string, search?: string, hash?: string, href?: string }} loc
 * @param {string[]} recentPageIds
 */
export function buildPageContext(loc, recentPageIds = []) {
  const pathname = loc.pathname || '/'
  const pageId = PATH_TO_PAGE[pathname] ?? 'unknown'
  const hash = (loc.hash || '').replace(/^#/, '')
  const sectionId = hash || null

  let visibleProductId = null
  let visibleProductKind = null
  if (pageId === 'prices' || pageId === 'products') {
    visibleProductKind = 'display_package'
  }

  return {
    current_url: loc.href || `${window.location.origin}${pathname}${loc.search || ''}${loc.hash || ''}`,
    page_id: pageId,
    section_id: sectionId,
    path: pathname,
    query: Object.fromEntries(new URLSearchParams(loc.search || '')),
    visible_product_id: visibleProductId,
    visible_product_kind: visibleProductKind,
    visible_service_id: SERVICE_BY_PAGE[pageId] ?? null,
    recent_page_ids: recentPageIds.slice(0, 8),
  }
}

export function pageIdFromPath(pathname) {
  return PATH_TO_PAGE[pathname] ?? 'unknown'
}
