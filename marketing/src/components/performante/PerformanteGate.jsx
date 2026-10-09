/**
 * Design OS: patterns/authentication_flow.md
 *
 * User journey
 *   Operator hits /performante or Alt+P → email+password → destinations
 *
 * UX flow
 *   Entry → loading → sign-in / forgot → destinations
 *
 * States
 *   Loading / Unsigned / Error / Success (destinations) / Forgot sent
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageSeo } from '../../lib/usePageSeo'
import {
  performanteForgotPassword,
  performanteLogin,
  performanteLogout,
  performanteMe,
} from '../../lib/performanteAuth'
import { PERFORMANTE_PATH } from '../../config/performantePath'

const PerformanteDestinations = lazy(() => import('./PerformanteDestinations'))

function Shell({ children }) {
  return (
    <div className="surface-obsidian flex min-h-screen flex-col text-cream">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16 sm:py-20">
        {children}
      </div>
    </div>
  )
}

function BrandHeader({ subtitle }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
        Operator bridge
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
        Performante
      </h1>
      {subtitle ? <p className="mt-3 text-sm text-cream/70">{subtitle}</p> : null}
    </>
  )
}

function LeaveLink() {
  return (
    <p className="mt-auto pt-12 text-xs text-cream/40">
      <Link
        to="/"
        className="underline-offset-2 hover:text-cream/70 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        Leave quietly
      </Link>
    </p>
  )
}

function fieldClassName() {
  return 'mt-1 w-full min-h-11 rounded-md border border-obsidian-line bg-obsidian-raised px-3 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold'
}

function LoadingShell() {
  return (
    <Shell>
      <BrandHeader subtitle="Checking your session…" />
      <div className="mt-10 space-y-3" role="status" aria-live="polite" aria-busy="true">
        <div className="h-14 animate-pulse rounded-md bg-cream/[0.06]" />
        <div className="h-14 animate-pulse rounded-md bg-cream/[0.06]" />
        <div className="h-14 animate-pulse rounded-md bg-cream/[0.06]" />
      </div>
      <LeaveLink />
    </Shell>
  )
}

export default function PerformanteGate() {
  usePageSeo({
    title: 'Performante',
    description: 'Private operator bridge.',
    path: PERFORMANTE_PATH,
    noindex: true,
  })

  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('signin') // signin | forgot | forgot-sent
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const me = await performanteMe()
      if (!cancelled) {
        setUser(me)
        setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus()
  }, [error])

  async function onSignIn(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await performanteLogin(email.trim(), password)
      setUser(data.user ?? null)
      setPassword('')
    } catch (err) {
      setError(err?.message || 'Sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function onForgot(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await performanteForgotPassword(email.trim())
      setMode('forgot-sent')
    } catch (err) {
      setError(err?.message || 'Could not send reset email')
    } finally {
      setSubmitting(false)
    }
  }

  async function onSignOut() {
    await performanteLogout()
    setUser(null)
    setMode('signin')
  }

  if (!ready) return <LoadingShell />

  if (user) {
    return (
      <Shell>
        <BrandHeader
          subtitle={
            <>
              Admin surfaces only. Press{' '}
              <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
                Alt
              </kbd>{' '}
              +{' '}
              <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
                P
              </kbd>{' '}
              from the marketing site to return here.
            </>
          }
        />
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-cream/45">
          <span className="truncate">{user.email || user.username}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-11 shrink-0 rounded-md px-2 text-cream/70 underline-offset-2 hover:text-cream hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Sign out
          </button>
        </div>
        <Suspense
          fallback={
            <div className="mt-10 space-y-3" role="status" aria-live="polite" aria-busy="true">
              <div className="h-14 animate-pulse rounded-md bg-cream/[0.06]" />
              <div className="h-14 animate-pulse rounded-md bg-cream/[0.06]" />
            </div>
          }
        >
          <PerformanteDestinations />
        </Suspense>
        <LeaveLink />
      </Shell>
    )
  }

  if (mode === 'forgot-sent') {
    return (
      <Shell>
        <BrandHeader subtitle="Check your inbox." />
        <p className="mt-6 text-sm text-cream/70" role="status">
          If an account exists for that email, a reset link is on its way. The link expires in 60
          minutes.
        </p>
        <button
          type="button"
          onClick={() => setMode('signin')}
          className="mt-8 min-h-11 self-start rounded-md border border-obsidian-line px-4 text-sm text-cream hover:border-gold/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Back to sign in
        </button>
        <LeaveLink />
      </Shell>
    )
  }

  if (mode === 'forgot') {
    return (
      <Shell>
        <BrandHeader subtitle="Reset your operator password." />
        <form className="mt-10 space-y-4" onSubmit={onForgot} noValidate>
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
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClassName()}
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="min-h-11 w-full rounded-md bg-[#e35a18] px-4 text-sm font-semibold text-[#12161d] transition hover:bg-[#ef7b42] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError('')
            }}
            className="min-h-11 w-full text-sm text-cream/60 underline-offset-2 hover:text-cream hover:underline"
          >
            Back to sign in
          </button>
        </form>
        <LeaveLink />
      </Shell>
    )
  }

  return (
    <Shell>
      <BrandHeader subtitle="Sign in with your operator email and password." />
      <form className="mt-10 space-y-4" onSubmit={onSignIn} noValidate>
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
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClassName()}
          />
        </label>
        <label className="block text-sm text-cream/80">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClassName()}
          />
        </label>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setMode('forgot')
              setError('')
            }}
            className="min-h-11 text-sm text-cream/55 underline-offset-2 hover:text-cream hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting || !email.trim() || !password}
          className="min-h-11 w-full rounded-md bg-[#e35a18] px-4 text-sm font-semibold text-[#12161d] transition hover:bg-[#ef7b42] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <LeaveLink />
    </Shell>
  )
}
