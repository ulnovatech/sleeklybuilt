import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { usePageSeo } from '../lib/usePageSeo'
import { performanteResetPassword } from '../lib/performanteAuth'
import { PERFORMANTE_PATH } from '../config/performantePath'

export default function PerformanteResetPasswordPage() {
  usePageSeo({
    title: 'Reset password · Performante',
    description: 'Set a new operator password.',
    path: `${PERFORMANTE_PATH}/reset-password`,
    noindex: true,
  })

  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token') || '', [params])
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('This reset link is missing a token. Request a new one from Performante.')
      return
    }
    if (password.length < 10) {
      setError('Use at least 10 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await performanteResetPassword(token, password)
      navigate(PERFORMANTE_PATH, { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not reset password')
      queueMicrotask(() => errorRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="surface-obsidian flex min-h-screen flex-col text-cream">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
          Operator bridge
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-cream">
          Choose a new password
        </h1>
        <p className="mt-3 text-sm text-cream/70">Then you will return to Performante signed in.</p>

        <form className="mt-10 space-y-4" onSubmit={onSubmit} noValidate>
          {error ? (
            <p
              ref={errorRef}
              tabIndex={-1}
              className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <label className="block text-sm text-cream/80">
            New password
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full min-h-11 rounded-md border border-obsidian-line bg-obsidian-raised px-3 text-sm text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </label>
          <label className="block text-sm text-cream/80">
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full min-h-11 rounded-md border border-obsidian-line bg-obsidian-raised px-3 text-sm text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 w-full rounded-md bg-[#e35a18] px-4 text-sm font-semibold text-[#12161d] transition hover:bg-[#ef7b42] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </form>

        <p className="mt-auto pt-12 text-xs text-cream/40">
          <Link
            to={PERFORMANTE_PATH}
            className="underline-offset-2 hover:text-cream/70 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Back to Performante
          </Link>
        </p>
      </div>
    </div>
  )
}
