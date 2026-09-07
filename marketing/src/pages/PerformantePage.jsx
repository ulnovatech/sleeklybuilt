/**
 * Lazy marketing entry for /performante.
 * Clerk SDK + gate load only when this route chunk is requested.
 * Destinations load in a further lazy chunk after allowlist success.
 */

import { ClerkProvider } from '@clerk/clerk-react'
import PerformanteGate from '../components/performante/PerformanteGate'
import { isPerformanteClerkConfigured } from '../lib/performanteAllowlist'
import { Link } from 'react-router-dom'
import { usePageSeo } from '../lib/usePageSeo'
import { PERFORMANTE_PATH } from '../config/performantePath'

function UnconfiguredBridge() {
  usePageSeo({
    title: 'Performante',
    description: 'Private operator bridge.',
    path: PERFORMANTE_PATH,
    noindex: true,
  })

  return (
    <div className="surface-obsidian flex min-h-screen flex-col text-cream">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
          Operator bridge
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
          Performante
        </h1>
        <p className="mt-6 text-sm text-cream/60" role="alert">
          Clerk is not configured for this build. Set{' '}
          <code className="text-cream/80">VITE_CLERK_PUBLISHABLE_KEY</code> and the admin
          allowlist, then rebuild. Destinations are not available.
        </p>
        <p className="mt-auto pt-12 text-xs text-cream/40">
          <Link
            to="/"
            className="underline-offset-2 hover:text-cream/70 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Leave quietly
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PerformantePage() {
  const pk = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()

  if (!isPerformanteClerkConfigured() || !pk) {
    return <UnconfiguredBridge />
  }

  return (
    <ClerkProvider publishableKey={pk} afterSignOutUrl="/">
      <PerformanteGate />
    </ClerkProvider>
  )
}
