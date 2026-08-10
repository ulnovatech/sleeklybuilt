import { useId, useState } from 'react'
import { apiEndpoints } from '../../site.config'
import { useFormSubmit } from '../../lib/useFormSubmit'
import { cn } from '../../lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Footer newsletter — short single-step with visible label (forms_system).
 * Not multi-step; proportionate to task length.
 */
export default function NewsletterForm({ className = '' }) {
  const fieldId = useId()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { submit, loading } = useFormSubmit({
    url: apiEndpoints.newsletter,
    successToast: true,
    onSuccess: () => {
      setEmail('')
      setError('')
      setSuccess(true)
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(false)
    const value = email.trim()
    if (!value) {
      setError('Enter your email address.')
      return
    }
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    try {
      await submit({ email: value })
    } catch {
      /* toast from hook */
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-2', className)} noValidate>
      <label htmlFor={fieldId} className="text-meta font-semibold text-cream/80">
        Email for updates
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={fieldId}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
            if (success) setSuccess(false)
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : success ? `${fieldId}-success` : undefined}
          placeholder="you@business.com"
          className="min-h-11 min-w-0 flex-1 rounded-dos-lg border border-cream/25 bg-cream/10 px-3 py-2.5 text-sm text-cream placeholder:text-cream/45 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 rounded-dos-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition duration-fast ease-dos hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse disabled:opacity-60"
        >
          {loading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-status-danger" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p id={`${fieldId}-success`} className="text-sm text-cream/80" role="status">
          You are on the list. We only send useful updates.
        </p>
      ) : null}
    </form>
  )
}
