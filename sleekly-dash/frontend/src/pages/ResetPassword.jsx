/**
 * Design OS: patterns/authentication_flow.md — Set new password
 * On success: signed in immediately with confirmation.
 */

import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { AuthError, AuthSuccess } from '../components/auth/AuthLayout'
import PasswordField, { passwordIsValid } from '../components/auth/PasswordField'

export default function ResetPassword() {
  const { user, resetPassword } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => params.get('token') || '', [params])

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expired, setExpired] = useState(!token)
  const [submitting, setSubmitting] = useState(false)

  if (user && success) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!passwordIsValid(password)) {
      setError('Choose a stronger password using the checklist below.')
      return
    }
    setSubmitting(true)
    try {
      const data = await resetPassword(token, password)
      setSuccess(data.message || 'Password updated. You are signed in.')
      setTimeout(() => navigate('/', { replace: true }), 800)
    } catch (err) {
      const hint = err.body?.hint
      if (hint === 'request_new_link' || /expired|invalid/i.test(err.message || '')) {
        setExpired(true)
        setError(err.message || 'This reset link has expired.')
      } else {
        setError(err.message || 'Could not update password.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (expired && !success) {
    return (
      <AuthLayout
        title="This reset link has expired"
        subtitle="Reset links are valid for 60 minutes so they cannot be reused later."
        footer={
          <Link to="/forgot-password" className="font-medium text-brand hover:underline">
            Send a new link
          </Link>
        }
      >
        <AuthError>{error}</AuthError>
        <Link
          to="/forgot-password"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Send a new link
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="You will be signed in after saving."
      footer={
        <Link to="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AuthError>{error}</AuthError>
      <AuthSuccess>{success}</AuthSuccess>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          readOnly={submitting || !!success}
          showRequirements
          label="New password"
        />

        <button
          type="submit"
          disabled={submitting || !!success || !password}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
        >
          {submitting ? 'Updating password…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
