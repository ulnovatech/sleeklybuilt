import { useEffect, useRef } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import ActionLink from './ActionLink'
import { useSiteConfig } from '../../context/SiteContactContext'

/**
 * Contact success — page state, not a new route (patterns/contact.md).
 * Required: reference, response window, reply-from, escalation.
 */
export default function SubmissionConfirmation({
  reference,
  email,
  onSendAnother,
  reducedMotion = false,
}) {
  const siteConfig = useSiteConfig()
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div
      className="rounded-2xl border border-cream-deep bg-surface-raised p-6 shadow-sm sm:p-8"
      role="status"
      aria-live="polite"
    >
      <p className="eyebrow">Message received</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 display-card text-emerald-deep outline-none focus-visible:ring-2 focus-visible:ring-dos"
      >
        We have your enquiry
      </h2>

      <dl className="mt-8 space-y-5 border-t border-cream-deep pt-6">
        <div>
          <dt className="text-meta font-semibold uppercase tracking-wide text-content-muted">Your reference</dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-emerald-deep">{reference}</dd>
        </div>
        <div>
          <dt className="text-meta font-semibold uppercase tracking-wide text-content-muted">When to expect a reply</dt>
          <dd className="mt-1 text-body text-ink-soft">Within one working day (Mon–Fri, EAT).</dd>
        </div>
        <div>
          <dt className="text-meta font-semibold uppercase tracking-wide text-content-muted">Reply will come from</dt>
          <dd className="mt-1 text-body text-ink-soft">{siteConfig.email}</dd>
        </div>
        {email ? (
          <div>
            <dt className="text-meta font-semibold uppercase tracking-wide text-content-muted">We recorded</dt>
            <dd className="mt-1 text-body text-ink-soft">Your message under {email}. Keep the reference if you follow up.</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-8 text-body text-ink-soft">
        Need something sooner? Message us on WhatsApp or call — mention reference{' '}
        <span className="font-mono font-semibold text-emerald-deep">{reference}</span>.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ActionLink href={siteConfig.whatsapp} variant="emerald">
          Chat on WhatsApp
          <FiArrowRight aria-hidden="true" />
        </ActionLink>
        <button
          type="button"
          onClick={onSendAnother}
          className={`inline-flex min-h-11 items-center justify-center rounded-full border border-subtle px-7 py-3.5 text-meta font-semibold text-action-primary-hover transition duration-fast ease-dos hover:border-action-primary/40 hover:bg-action-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 ${
            reducedMotion ? '' : ''
          }`}
        >
          Send another message
        </button>
      </div>
    </div>
  )
}
