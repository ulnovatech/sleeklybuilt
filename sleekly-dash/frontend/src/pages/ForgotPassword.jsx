import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthLayout, { AuthError, AuthSuccess } from '../components/auth/AuthLayout'
import { AuthAPI } from '../services/api'
import { isClerkConfigured } from '../lib/clerkToken'

/**
 * Design OS: patterns/authentication_flow.md — Recover
 * Under Clerk SSO, recovery is handled in Clerk — this page redirects.
 */

export default function ForgotPassword() {
  if (isClerkConfigured()) {
    return <Navigate to="/login" replace />
  }
  return <ForgotPasswordForm />
}

function ForgotPasswordForm() {
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
        <Link to="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AuthError>{error || null}</AuthError>
      <AuthSuccess>{success || null}</AuthSuccess>
      {debugLink ? (
        <p className="mb-4 break-all text-xs text-slate-500">
          Debug reset URL: {debugLink}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-700 bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  )
}
