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
