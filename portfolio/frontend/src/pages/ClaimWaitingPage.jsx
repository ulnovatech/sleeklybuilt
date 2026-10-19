/**
 * Post-claim waiting page — never claims “Payment confirmed” until verified.
 * UX-GATE C2 · lookup: claim_ref + phone
 */

import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCopy, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiEndpoints, hubHref, siteConfig } from '../site.config'

export default function ClaimWaitingPage() {
  const [searchParams] = useSearchParams()
  const claimRef = (searchParams.get('ref') || searchParams.get('claim_ref') || '').toUpperCase()
  const phone = searchParams.get('phone') || ''

  const [state, setState] = useState({ status: 'loading', data: null, error: '' })

  const load = useCallback(async () => {
    if (!claimRef || !phone) {
      setState({
        status: 'error',
        data: null,
        error: 'Missing payment reference or phone. Use the link from checkout or track your order.',
      })
      return
    }
    setState((prev) => ({ ...prev, status: prev.data ? 'refreshing' : 'loading', error: '' }))
    try {
      const response = await fetch(apiEndpoints.paymentClaimStatus, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_ref: claimRef, phone }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        setState({
          status: 'error',
          data: null,
          error: data.message || 'Could not load status.',
        })
        return
      }
      setState({ status: 'ready', data, error: '' })
    } catch {
      setState({
        status: 'error',
        data: null,
        error: 'Could not load status. Check your connection and try again.',
      })
    }
  }, [claimRef, phone])

  useEffect(() => {
    load()
  }, [load])

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(claimRef)
      toast.success('Reference copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  const data = state.data
  const verified = Boolean(data?.verified)
  const partial = data?.status === 'partial'
  const rejected = data?.status === 'rejected' || data?.status === 'not_found'

  return (
    <div className="bg-surface-base py-12 md:py-16">
      <div className="mx-auto max-w-lg px-6">
        {state.status === 'loading' ? (
          <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading payment status">
            <div className="h-8 w-2/3 rounded bg-surface-sunken" />
            <div className="h-24 rounded-xl bg-surface-sunken" />
            <div className="h-16 rounded-xl bg-surface-sunken" />
          </div>
        ) : null}

        {state.status === 'error' && !data ? (
          <div className="rounded-xl border border-status-danger/30 bg-status-danger/5 p-6" role="alert">
            <h1 className="font-display text-display-card text-emerald-deep">Couldn’t load status</h1>
            <p className="mt-3 text-body text-ink-soft">{state.error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-subtle bg-surface-raised px-5 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              <FiRefreshCw aria-hidden="true" />
              Try again
            </button>
            <p className="mt-4 text-sm text-ink-soft">
              Or{' '}
              <a href={hubHref('contact')} className="font-semibold text-emerald-deep underline-offset-2 hover:underline">
                contact us
              </a>
              .
            </p>
          </div>
        ) : null}

        {data ? (
          <div className="space-y-6">
            <header>
              <p className="eyebrow">{verified ? 'Verified' : partial ? 'Partial' : 'Payment claim'}</p>
              <h1 className="mt-2 font-display text-display-section text-emerald-deep">
                {verified
                  ? 'Your payment is verified'
                  : partial
                    ? 'We received part of your payment'
                    : rejected
                      ? 'We could not verify this payment yet'
                      : 'We’re checking your payment'}
              </h1>
              <p className="mt-3 text-body text-ink-soft">{data.message}</p>
            </header>

            <section className="rounded-xl border border-subtle bg-surface-raised p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Your reference</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xl font-semibold text-emerald-deep">{data.claim_ref}</p>
                <button
                  type="button"
                  onClick={copyRef}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-subtle px-3 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  <FiCopy aria-hidden="true" />
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-ink-soft">Keep this reference and your phone number to track status.</p>
            </section>

            <section className="rounded-xl border border-subtle bg-surface-sunken p-5 text-sm">
              <dl className="space-y-3">
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Status</dt>
                  <dd className="font-semibold text-ink">{data.status_label}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Amount</dt>
                  <dd className="font-medium text-ink">{data.amount_label}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Method</dt>
                  <dd className="font-medium text-ink">{data.provider_label}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-content-muted">Package</dt>
                  <dd className="font-medium text-ink">{data.package_title}</dd>
                </div>
              </dl>
            </section>

            {verified && data.receipt_number ? (
              <section className="rounded-xl border border-status-success/25 bg-status-success-surface p-5">
                <p className="text-meta font-semibold text-status-success">Payment confirmed</p>
                <p className="mt-2 text-body text-ink">
                  We&apos;ve received your {data.amount_label} payment via {data.provider_label}. Your{' '}
                  {data.package_title} package is confirmed — our team will contact you about next steps.
                </p>
                <p className="mt-3 text-sm font-medium text-emerald-deep">
                  Receipt: <span className="font-mono">{data.receipt_number}</span>
                </p>
              </section>
            ) : null}

            {!verified ? (
              <p className="text-sm text-ink-soft">
                You do not need to send us a Mobile Money transaction reference. We verify against our merchant
                account.
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={load}
                disabled={state.status === 'refreshing'}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-subtle bg-surface-raised px-5 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-60"
              >
                <FiRefreshCw aria-hidden="true" />
                {state.status === 'refreshing' ? 'Refreshing…' : 'Refresh status'}
              </button>
              <a
                href={siteConfig.whatsapp || hubHref('contact')}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-action-primary-hover px-5 text-meta font-semibold text-cream hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Contact us
              </a>
            </div>

            <p className="text-center text-sm text-ink-soft">
              <Link to="/order" className="font-semibold text-emerald-deep underline-offset-2 hover:underline">
                Back to order
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
