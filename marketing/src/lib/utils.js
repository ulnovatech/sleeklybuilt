/** Join class names — lightweight alternative to clsx + tailwind-merge */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/**
 * True for destinations the router cannot handle: absolute URLs and the
 * portfolio SPA, which is a separate application served from the same origin.
 */
export function isExternalHref(href = '') {
  return href.startsWith('http') || href.startsWith('/portfolio-app')
}
