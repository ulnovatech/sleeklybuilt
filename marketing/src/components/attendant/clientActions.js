import { isExternalHref } from '../../lib/utils'

const HIGHLIGHT_CLASS = 'attendant-section-highlight'
const HIGHLIGHT_MS = 2800

/**
 * Apply server-resolved navigation / highlight. Paths come from the registry only.
 * @param {{ type?: string, path?: string, hash?: string|null, external?: boolean }} action
 * @param {{ navigate: (to: string) => void }} router
 */
export function applyClientAction(action, { navigate }) {
  if (!action || !action.path) return

  const path = String(action.path)
  const hash = action.hash ? String(action.hash).replace(/^#/, '') : ''
  const external = Boolean(action.external) || isExternalHref(path)

  if (external) {
    const dest = hash ? `${path.replace(/\/?$/, '/')}#${hash}` : path
    window.location.assign(dest)
    return
  }

  const to = hash ? `${path}#${hash}` : path
  navigate(to)

  if (hash && (action.type === 'highlight' || action.hash)) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => highlightSection(hash), 80)
    })
  }
}

export function highlightSection(sectionId) {
  if (!sectionId) return
  const el =
    document.querySelector(`[data-attendant-section="${CSS.escape(sectionId)}"]`) ||
    document.getElementById(sectionId)
  if (!el) return

  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  el.classList.add(HIGHLIGHT_CLASS)
  window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
