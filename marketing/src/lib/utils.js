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

/**
 * Active state for primary nav. External / cross-SPA destinations never show as
 * current on the marketing hub (Wave 9 Phase D — no false “Projects” active).
 */
export function isNavItemActive(item, pathname) {
  if (!item?.href || isExternalHref(item.href)) return false
  if (item.href === '/') return pathname === '/'
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/** Focusable controls inside a dialog/drawer for Tab trapping. */
export function getFocusableElements(container) {
  if (!container) return []
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')
}

/**
 * Trap Tab inside `container`; Escape calls `onEscape`.
 * Returns cleanup. Call when a modal/drawer opens.
 */
export function bindFocusTrap(container, { onEscape } = {}) {
  if (!container) return () => {}

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      onEscape?.(event)
      return
    }
    if (event.key !== 'Tab') return

    const focusable = getFocusableElements(container)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  document.addEventListener('keydown', onKeyDown)
  return () => document.removeEventListener('keydown', onKeyDown)
}
