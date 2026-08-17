import { isExternalHref } from '../../lib/utils'

const HIGHLIGHT_CLASS = 'attendant-section-highlight'
const HIGHLIGHT_MS = 2800
const HIGHLIGHT_RETRY_MS = 120
const HIGHLIGHT_ATTEMPTS = 16

/**
 * Apply server-resolved navigation / highlight. Paths come from the registry only.
 * @param {{ type?: string, path?: string, hash?: string|null, section_id?: string|null, external?: boolean }} action
 * @param {{ navigate: (to: string) => void }} router
 */
export function applyClientAction(action, { navigate }) {
  if (!action || !action.path) return

  const path = String(action.path)
  const hash = action.hash ? String(action.hash).replace(/^#/, '') : ''
  const sectionId = action.section_id ? String(action.section_id) : ''
  const external = Boolean(action.external) || isExternalHref(path)

  // Path-segment pages (policies) send hash:null — still focus via section_id.
  const focusId = hash || sectionId
  const shouldFocus =
    Boolean(focusId) &&
    (action.type === 'highlight' || Boolean(hash) || Boolean(sectionId))

  if (external) {
    const dest = hash ? `${path.replace(/\/?$/, '/')}#${hash}` : path
    window.location.assign(dest)
    return
  }

  const to = hash ? `${path}#${hash}` : path
  navigate(to)

  if (shouldFocus) {
    window.requestAnimationFrame(() => {
      highlightSection(focusId)
    })
  }
}

/**
 * Scroll to a stamped section and apply a brief outline.
 * Retries briefly so async routes (policy markdown) can mount.
 * @param {string} sectionId
 * @param {{ attempts?: number }} [opts]
 */
export function highlightSection(sectionId, opts = {}) {
  if (!sectionId) return
  const attempts = typeof opts.attempts === 'number' ? opts.attempts : HIGHLIGHT_ATTEMPTS

  const el =
    document.querySelector(`[data-attendant-section="${CSS.escape(sectionId)}"]`) ||
    document.getElementById(sectionId)

  if (!el) {
    if (attempts > 1) {
      window.setTimeout(() => highlightSection(sectionId, { attempts: attempts - 1 }), HIGHLIGHT_RETRY_MS)
    }
    return
  }

  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  el.classList.add(HIGHLIGHT_CLASS)
  if (typeof el.focus === 'function') {
    const prevTabIndex = el.getAttribute('tabindex')
    if (prevTabIndex === null && !el.matches('a, button, input, textarea, select, [tabindex]')) {
      el.setAttribute('tabindex', '-1')
    }
    try {
      el.focus({ preventScroll: true })
    } catch {
      /* ignore */
    }
    if (prevTabIndex === null && el.getAttribute('tabindex') === '-1') {
      window.setTimeout(() => {
        if (document.activeElement === el) return
        el.removeAttribute('tabindex')
      }, HIGHLIGHT_MS + 50)
    }
  }
  window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
