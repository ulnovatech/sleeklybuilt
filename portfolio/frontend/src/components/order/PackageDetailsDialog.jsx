import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiX } from 'react-icons/fi'
import { formatUgx } from '../../config/packages'

/**
 * Package contents overlay — Design OS dialogs.md (short decision + Escape/backdrop close).
 */
export default function PackageDetailsDialog({ plan, open, onClose, onSelect }) {
  const titleId = useId()
  const descId = useId()
  const closeRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open || !plan) return undefined

    previouslyFocused.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => closeRef.current?.focus())

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !closeRef.current) return

      const panel = closeRef.current.closest('[data-package-dialog-panel]')
      if (!panel) return
      const focusable = panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
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
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, plan, onClose])

  if (!open || !plan || typeof document === 'undefined') return null

  const features = Array.isArray(plan.features) ? plan.features : []

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-obsidian/50 backdrop-blur-[2px] transition-opacity"
        aria-label="Close package details"
        onClick={onClose}
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        data-package-dialog-panel
        className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-subtle bg-surface-raised shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-subtle px-5 py-4">
          <div className="min-w-0">
            <p className="text-meta font-semibold uppercase tracking-wide text-emerald-deep">Package details</p>
            <h2 id={titleId} className="mt-1 font-display text-display-card text-emerald-deep">
              {plan.title}
            </h2>
            <p id={descId} className="mt-1 text-meta text-ink-soft">
              {plan.idealFor || 'What you get with this package.'}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-sunken hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <div className="rounded-xl bg-surface-sunken px-4 py-3">
            <p className="text-lg font-bold text-emerald-deep">{formatUgx(plan.priceUgx)}</p>
            <p className="mt-1 text-xs text-ink-soft">
              Deposit today:{' '}
              <span className="font-semibold text-ink">{formatUgx(plan.depositUgx)}</span>
            </p>
          </div>

          {features.length === 0 ? (
            <p className="mt-4 text-meta text-ink-soft" role="status">
              Feature list is unavailable for this package. Message us and we will confirm what is included.
            </p>
          ) : (
            <ul className="mt-4 space-y-3" aria-label={`Included in ${plan.title}`}>
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-meta text-ink">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-success-surface text-status-success"
                    aria-hidden="true"
                  >
                    <FiCheck className="h-3 w-3" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-subtle px-5 py-4 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => onSelect?.(plan.id)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-action-primary-hover px-5 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Choose this package
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-subtle bg-surface-raised px-5 text-meta font-semibold text-ink transition hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
