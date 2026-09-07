import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { AuthError } from '../components/auth/AuthLayout'
import PasswordField, { passwordIsValid } from '../components/auth/PasswordField'
import { AuthAPI } from '../services/api'
import { isClerkConfigured } from '../lib/clerkToken'

export default function Register() {
  if (isClerkConfigured()) {
    return <Navigate to="/login" replace />
  }
  return <RegisterPassword />
}

function RegisterPassword() {
  const { user, register } = useAuth()
  const errorRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signupOpen, setSignupOpen] = useState(null)

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
    if (error && errorRef.current) errorRef.current.focus()
  }, [error])

  if (user) return <Navigate to="/" replace />

  if (signupOpen === false) {
    return (
      <AuthLayout title="Registration closed" subtitle="Ask an administrator for access.">
        <p className="text-sm text-slate-400">
          <Link to="/login" className="font-medium text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!passwordIsValid(password)) {
      setError('Choose a stronger password.')
      return
    }
    setSubmitting(true)
    try {
      await register({
        email: email.trim(),
        password,
        display_name: displayName.trim(),
      })
    } catch (err) {
      setError(err.message || 'Could not create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Dashboard access for your team."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div ref={errorRef} tabIndex={-1}>
        <AuthError>{error || null}</AuthError>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="display_name" className="mb-2 block text-sm font-medium text-slate-300">
            Name
          </label>
          <input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
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
        <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
        <button
          type="submit"
          disabled={submitting || signupOpen === null}
          className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
