export {
  cn,
  bindFocusTrap,
  getFocusableElements,
} from '@sleeklybuilt/design-foundation/react'

/**
 * True for destinations the router cannot handle: absolute URLs and the
 * portfolio SPA, which is a separate application served from the same origin.
 */
export function isExternalHref(href = '') {
  return href.startsWith('http') || href.startsWith('/portfolio-app')
}

/**
 * Active state for primary nav. External / cross-SPA destinations never show as
 * current on the marketing hub (Wave 9 Phase D — no false “Projects” active).
 */
export function isNavItemActive(item, pathname) {
  if (!item?.href || isExternalHref(item.href)) return false
  if (item.href === '/') return pathname === '/'
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
