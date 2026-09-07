import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PERFORMANTE_PATH } from '../../config/performantePath'

function isTypingTarget(target) {
  if (!target || !(target instanceof Element)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return Boolean(target.closest('[contenteditable="true"]'))
}

/**
 * Global Alt+P → /performante (operator bridge).
 * Alt+Shift+P also works when the browser steals plain Alt+P (common on Firefox menus).
 * Skips when focus is in a form field so typing is undisturbed.
 * Auth + destinations are enforced on the route itself — shortcut never reveals destinations.
 */
export default function PerformanteShortcut() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key.toLowerCase() !== 'p') return
      // Allow plain Alt+P or Alt+Shift+P; reject other modifiers.
      if (isTypingTarget(event.target)) return

      event.preventDefault()
      if (location.pathname === PERFORMANTE_PATH) return
      navigate(PERFORMANTE_PATH)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, location.pathname])

  return null
}
