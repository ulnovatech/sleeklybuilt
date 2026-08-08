/**
 * Design OS: patterns/authentication_flow.md — Sign up
 * Minimum fields: email + password. Signs in immediately on success.
 */

import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { AuthError } from '../components/auth/AuthLayout'
import PasswordField, { passwordIsValid } from '../components/auth/PasswordField'
import { AuthAPI } from '../services/api'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    let cancelled = false
    AuthAPI.capabilities()
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({ signup_open: false, message: 'Could not check signup availability.' })
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStatus(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (user) {
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
      await register({
        email: email.trim(),
        password,
        display_name: displayName.trim(),
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create account.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingStatus) {
    return (
      <AuthLayout title="Create account" subtitle="Checking availability…">
        <div className="h-40 animate-pulse rounded-xl bg-gray-800/60" aria-busy="true" />
      </AuthLayout>
    )
  }

  if (!status?.signup_open) {
    return (
      <AuthLayout
        title="Account creation is closed"
        subtitle={status?.message || 'Ask an administrator to create your account.'}
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          For security, Sleekly Dash does not allow open registration after the first admin exists.
          An admin can add you under Settings → Team.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={status?.reason === 'first_user' ? 'Create the first admin' : 'Create account'}
      subtitle={status?.message || 'Email and password are enough to get started.'}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthError>{error}</AuthError>

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

        <div>
          <label htmlFor="display_name" className="mb-2 block text-sm font-medium text-slate-300">
            Display name <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="display_name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            readOnly={submitting}
            className="w-full rounded-lg border border-gray-700 bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          readOnly={submitting}
          showRequirements
        />

        <button
          type="submit"
          disabled={submitting || !email.trim() || !password}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
