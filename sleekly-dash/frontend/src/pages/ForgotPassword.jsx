/**
 * Design OS: patterns/authentication_flow.md — Recover
 * Request reset → confirm message sent (never enumerate accounts).
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { AuthError, AuthSuccess } from '../components/auth/AuthLayout'
import { AuthAPI } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [debugLink, setDebugLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setDebugLink('')
    setSubmitting(true)
    try {
      const data = await AuthAPI.forgotPassword(email.trim())
      setSuccess(data.message || 'If an account exists for that email, a reset link is on its way.')
      if (data.reset_url) {
        setDebugLink(data.reset_url)
      }
    } catch (err) {
      setError(err.message || 'Could not send reset link. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email a link that expires in 60 minutes."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthError>{error}</AuthError>
      <AuthSuccess>{success}</AuthSuccess>

      {debugLink ? (
        <p className="mb-4 break-all rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Dev reset link:{' '}
          <a href={debugLink} className="underline">
            {debugLink}
          </a>
        </p>
      ) : null}

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={submitting}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
          >
            {submitting ? 'Sending link…' : 'Send reset link'}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setSuccess('')
            setDebugLink('')
          }}
          className="min-h-11 w-full rounded-lg border border-gray-700 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
        >
          Send another link
        </button>
      )}
    </AuthLayout>
  )
}
