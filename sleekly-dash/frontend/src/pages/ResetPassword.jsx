/**
 * Design OS: patterns/authentication_flow.md — Set new password
 * Under Clerk SSO, recovery is handled in Clerk — this page redirects.
 */

import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { AuthError, AuthSuccess } from '../components/auth/AuthLayout'
import PasswordField, { passwordIsValid } from '../components/auth/PasswordField'
import { isClerkConfigured } from '../lib/clerkToken'

export default function ResetPassword() {
  if (isClerkConfigured()) {
    return <Navigate to="/login" replace />
  }
  return <ResetPasswordForm />
}

function ResetPasswordForm() {
  const { user, resetPassword } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => params.get('token') || '', [params])

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && success) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!token) {
      setError('This reset link is missing a token. Request a new one.')
      return
    }
    if (!passwordIsValid(password)) {
      setError('Choose a stronger password.')
      return
    }
    setSubmitting(true)
    try {
      const data = await resetPassword(token, password)
      setSuccess(data.message || 'Password updated. You are signed in.')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setError(err.message || 'Could not reset password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use a strong password you have not used elsewhere."
      footer={
        <Link to="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AuthError>{error || null}</AuthError>
      <AuthSuccess>{success || null}</AuthSuccess>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          readOnly={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !password}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
