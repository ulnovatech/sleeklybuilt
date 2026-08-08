/**
 * Design OS: patterns/authentication_flow.md
 *
 * User journey: arrive at gate → enter email/password → land on destination
 * Empty: untouched form, no red. Loading: Signing in… fields read-only.
 * Error: generic message + reset link. Success: redirect via AuthContext.
 */

import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { AuthError } from '../components/auth/AuthLayout'
import PasswordField from '../components/auth/PasswordField'
import { AuthAPI } from '../services/api'

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const errorRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signupOpen, setSignupOpen] = useState(null)

  const from = location.state?.from || '/'

  useEffect(() => {
    let cancelled = false
    AuthAPI.capabilities()
      .then((data) => {
        if (!cancelled) setSignupOpen(!!data.signup_open)
      })
      .catch(() => {
        if (!cancelled) setSignupOpen(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  if (user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Email or password is incorrect.')
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access leads, companies, and requests."
      footer={
        signupOpen ? (
          <>
            New here?{' '}
            <Link to="/register" className="font-medium text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              Create account
            </Link>
          </>
        ) : signupOpen === false ? (
          <span>Need an account? Ask an admin in Settings → Team.</span>
        ) : null
      }
    >
      <div ref={errorRef} tabIndex={-1}>
        <AuthError>
          {error ? (
            <>
              {error}{' '}
              <Link to="/forgot-password" className="underline hover:text-white">
                Reset your password
              </Link>
            </>
          ) : null}
        </AuthError>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={submitting}
            required
            className="w-full rounded-lg border border-gray-700 bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <PasswordField
          value={password}
          onChange={setPassword}
          readOnly={submitting}
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="min-h-11 text-sm text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-1 py-2"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting || !email.trim() || !password}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
