/**
 * Design OS: patterns/authentication_flow.md + docs/AUTH_SSO.md
 *
 * User journey
 *   Operator hits /performante or Alt+P → prove Clerk identity → allowlist → pick admin surface
 *
 * UX flow
 *   Entry → loading (Clerk) → sign-in OR deny OR destinations → leave
 *
 * Screen layout
 *   Bare obsidian shell (no marketing chrome / attendant). One primary column.
 *
 * Component structure
 *   PerformantePage (ClerkProvider when configured)
 *     → PerformanteGate (auth states)
 *       → lazy PerformanteDestinations (only after allowlist pass)
 *
 * States
 *   Loading: skeleton matching title + list rhythm
 *   Empty/unavailable: Clerk or allowlist not configured — no destinations
 *   Unsigned: Sign-in only — no destination list in DOM
 *   Denied: signed in but not allowlisted — sign out, no destinations
 *   Success: destinations + shortcut documentation
 *   Error: Clerk load failure message + leave link
 */

import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { SignIn, SignOutButton, useAuth, useUser } from '@clerk/clerk-react'
import { usePageSeo } from '../../lib/usePageSeo'
import {
  isPerformanteAllowlistConfigured,
  isPerformanteOperator,
} from '../../lib/performanteAllowlist'
import { PERFORMANTE_PATH } from '../../config/performantePath'

const PerformanteDestinations = lazy(() => import('./PerformanteDestinations'))

const signInAppearance = {
  variables: {
    colorPrimary: '#e35a18',
    colorBackground: '#11151c',
    colorInputBackground: '#07090d',
    colorInputText: '#f3f5f7',
    colorText: '#f3f5f7',
    colorTextSecondary: 'rgba(243,245,247,0.7)',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'mx-auto w-full max-w-sm',
    card: 'border border-[#1e2430] bg-[#11151c] shadow-none',
    headerTitle: 'text-cream',
    headerSubtitle: 'text-cream/70',
    socialButtonsBlockButton: 'border-[#1e2430] bg-[#07090d] text-cream',
    formButtonPrimary: 'bg-[#e35a18] text-[#12161d] hover:bg-[#ef7b42]',
    footerAction: 'hidden',
  },
}

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

function UnavailableShell({ title, body }) {
  return (
    <Shell>
      <BrandHeader subtitle={title} />
      <p className="mt-6 text-sm text-cream/60" role="alert">
        {body}
      </p>
      <LeaveLink />
    </Shell>
  )
}

/**
 * Auth gate — destinations load only after allowlist success.
 */
export default function PerformanteGate() {
  usePageSeo({
    title: 'Performante',
    description: 'Private operator bridge.',
    path: PERFORMANTE_PATH,
    noindex: true,
  })

  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()
  const focusRef = useRef(null)

  const ready = authLoaded && userLoaded
  const allowed = Boolean(isSignedIn && user && isPerformanteOperator(user))

  useEffect(() => {
    if (!ready) return
    if (allowed) return
    focusRef.current?.focus?.()
  }, [ready, allowed, isSignedIn])

  if (!isPerformanteAllowlistConfigured()) {
    return (
      <UnavailableShell
        title="Bridge not configured."
        body="Set VITE_CLERK_ADMIN_USER_ID (preferred) and/or VITE_CLERK_ADMIN_EMAIL, rebuild marketing, then try again. Destinations stay hidden until the allowlist is set."
      />
    )
  }

  if (!ready) {
    return <LoadingShell />
  }

  if (!isSignedIn) {
    return (
      <Shell>
        <BrandHeader subtitle="Sign in with the operator Clerk account. Destinations stay hidden until you are verified." />
        <div className="mt-10" ref={focusRef} tabIndex={-1}>
          <SignIn
            routing="hash"
            forceRedirectUrl={PERFORMANTE_PATH}
            fallbackRedirectUrl={PERFORMANTE_PATH}
            signUpUrl={undefined}
            appearance={signInAppearance}
          />
        </div>
        <LeaveLink />
      </Shell>
    )
  }

  if (!allowed) {
    return (
      <Shell>
        <BrandHeader subtitle="This account is not on the operator allowlist." />
        <p className="mt-6 text-sm text-cream/60" role="alert">
          Use the single admin Clerk user configured for SleeklyBuilt. Destinations are not shown.
        </p>
        <div className="mt-8">
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="min-h-11 rounded-md border border-obsidian-line bg-obsidian-raised px-4 text-sm font-medium text-cream transition hover:border-gold/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
        <LeaveLink />
      </Shell>
    )
  }

  return (
    <Shell>
      <BrandHeader
        subtitle={
          <>
            Admin surfaces only. Not listed in the sitemap. Press{' '}
            <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
              Alt
            </kbd>{' '}
            +{' '}
            <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
              P
            </kbd>{' '}
            from the marketing site to return here
            <span className="text-cream/50">
              {' '}
              (or{' '}
              <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
                Alt
              </kbd>
              +
              <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
                Shift
              </kbd>
              +
              <kbd className="rounded border border-obsidian-line bg-obsidian-raised px-1.5 py-0.5 font-mono text-xs text-cream">
                P
              </kbd>{' '}
              if the browser captures Alt+P).
            </span>
          </>
        }
      />
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-cream/45">
        <span className="truncate">{user.primaryEmailAddress?.emailAddress || user.id}</span>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-md px-2 text-cream/70 underline-offset-2 hover:text-cream hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Sign out
          </button>
        </SignOutButton>
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
