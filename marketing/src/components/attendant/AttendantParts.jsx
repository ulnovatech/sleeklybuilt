import { emptyCopyForPage } from './emptyCopy'
import { useSiteConfig } from '../../context/SiteContactContext'

export function AttendantEmpty({ pageId }) {
  return (
    <div className="px-4 py-6">
      <p className="text-sm leading-relaxed text-content-secondary">{emptyCopyForPage(pageId)}</p>
    </div>
  )
}

export function AttendantError({ error, onRetry, onReset }) {
  const siteConfig = useSiteConfig()
  const siteHint =
    error?.code === 'missing_api_key'
      ? "I can't reply just now."
      : error?.message || "Something went wrong. Nothing was submitted."

  return (
    <div
      className="mx-4 mb-3 rounded-lg border border-subtle bg-surface-sunken px-3 py-3"
      role="alert"
    >
      <p className="text-sm text-content-primary">{siteHint}</p>
      <p className="mt-1 text-xs text-content-muted">
        Nothing was submitted as a lead or quote from this error. Retry, or reach us on WhatsApp or call.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 rounded-md bg-action-primary px-3 text-sm font-medium text-cream transition hover:bg-action-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Retry
          </button>
        ) : null}
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-md border border-subtle bg-surface-raised px-3 text-sm text-content-primary transition hover:border-action-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            New chat
          </button>
        ) : null}
        <a
          href={siteConfig.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-md border border-subtle bg-surface-raised px-3 text-sm text-content-primary transition hover:border-action-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          WhatsApp
        </a>
      </div>
    </div>
  )
}

export function AttendantConfirm({ pending, busy, onConfirm, onCancel }) {
  if (!pending) return null
  return (
    <div className="mx-4 mb-3 rounded-lg border border-subtle bg-surface-raised px-3 py-3 shadow-sm">
      <p className="text-sm font-medium text-content-primary">Confirm before I send</p>
      <p className="mt-1 text-sm leading-relaxed text-content-secondary">{pending.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="min-h-11 rounded-md bg-action-primary px-3 text-sm font-medium text-cream transition hover:bg-action-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Confirm'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="min-h-11 rounded-md border border-subtle px-3 text-sm text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/**
 * Progressive Decision UI chips (in-turn only — not an empty-state wall).
 * Design OS attendant pattern: interaction block like confirm, one decision at a time.
 */
export function AttendantChoices({ pending, busy, onSelect, onCancel }) {
  if (!pending?.options?.length) return null
  const multi = Boolean(pending.multi)

  return (
    <div
      className="mx-4 mb-3 rounded-lg border border-subtle bg-surface-raised px-3 py-3 shadow-sm"
      role="group"
      aria-label={pending.prompt || 'Choose an option'}
    >
      {pending.prompt ? (
        <p className="text-sm font-medium text-content-primary">{pending.prompt}</p>
      ) : null}
      <div className={`flex flex-col gap-2 ${pending.prompt ? 'mt-3' : ''}`}>
        {pending.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={busy}
            onClick={() => onSelect([opt.id])}
            className="min-h-11 w-full rounded-md border border-subtle bg-surface-base px-3 py-2.5 text-left text-sm text-content-primary transition hover:border-action-primary/40 hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-50"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {multi ? (
          <p className="text-xs text-content-muted">Tap one option to continue.</p>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="min-h-11 rounded-md px-2 text-sm text-content-muted underline-offset-2 hover:text-content-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

export function AttendantMessage({ message }) {
  const isVisitor = message.role === 'visitor'
  const isSystem = message.role === 'system'
  const isHuman = message.role === 'human'
  if (isSystem) {
    return (
      <div className="px-4 py-1">
        <p className="text-xs leading-relaxed text-content-muted">{message.text}</p>
      </div>
    )
  }

  return (
    <div className={`flex px-4 py-1.5 ${isVisitor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isVisitor
            ? 'bg-action-primary text-cream'
            : 'bg-surface-sunken text-content-primary'
        }`}
      >
        {isHuman ? (
          <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-content-muted">
            Team
          </span>
        ) : null}
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.status === 'streaming' ? (
          <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-content-muted align-middle" aria-hidden="true" />
        ) : null}
        {message.status === 'sending' ? (
          <span className="mt-1 block text-[10px] opacity-70">Sending…</span>
        ) : null}
        {message.status === 'failed' ? (
          <span className="mt-1 block text-[10px] opacity-80">Not sent</span>
        ) : null}
      </div>
    </div>
  )
}

export function AttendantStatus({ sessionStatus }) {
  if (sessionStatus !== 'loading') return null
  return (
    <div className="space-y-2 px-4 py-4" aria-hidden="true">
      <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-surface-sunken" />
      <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-surface-sunken" />
    </div>
  )
}
