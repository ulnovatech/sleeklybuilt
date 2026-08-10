import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiHome, FiRefreshCw, FiXCircle } from 'react-icons/fi'
import { apiEndpoints, hubHref } from '../site.config'
import { useSiteConfig } from '../context/SiteContactContext'

/**
 * Payment confirmation — status colors via semantic tokens (Wave 9 Phase E).
 * No emoji celebration; track-order via hubHref.
 */
export default function OrderSuccess() {
  const siteConfig = useSiteConfig()
  const [searchParams] = useSearchParams()
  const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref') || ''
  const [state, setState] = useState({ loading: true, data: null, error: null })

  const verifyPayment = async () => {
    if (!txRef) {
      setState({
        loading: false,
        data: null,
        error: 'Missing payment reference. Contact us if you were charged.',
      })
      return
    }

    setState({ loading: true, data: null, error: null })

    try {
      const response = await fetch(apiEndpoints.paymentVerify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: txRef }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setState({ loading: false, data: result, error: null })
        return
      }

      if (response.status === 202 || result.status === 'pending') {
        setState({
          loading: false,
          data: { status: 'pending', tx_ref: txRef, message: result.message },
          error: null,
        })
        return
      }

      setState({
        loading: false,
        data: null,
        error: result.message || 'Payment verification failed.',
      })
    } catch (error) {
      console.error(error)
      setState({
        loading: false,
        data: null,
        error: 'Could not verify payment. Try again in a moment.',
      })
    }
  }

  useEffect(() => {
    verifyPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- verify when txRef changes
  }, [txRef])

  const primaryBtn =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-action-primary-hover px-5 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos'
  const secondaryBtn =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-subtle bg-surface-raised px-5 text-meta font-semibold text-ink transition hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos'

  if (state.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface-base px-6">
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-subtle border-t-emerald"
            aria-hidden="true"
          />
          <h1 className="font-display text-display-card text-emerald-deep">Confirming your payment…</h1>
          <p className="mt-2 text-meta text-ink-soft">Hang tight — we&apos;re confirming your deposit.</p>
        </div>
      </div>
    )
  }

  if (state.data?.status === 'successful' || state.data?.success) {
    return (
      <div className="mx-auto max-w-lg bg-surface-base px-6 py-12">
        <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center shadow-sm">
          <FiCheckCircle className="mx-auto mb-4 h-12 w-12 text-status-success" aria-hidden="true" />
          <h1 className="font-display text-display-section text-emerald-deep">You&apos;re all set — we&apos;ll start building</h1>
          <p className="mt-3 text-body text-ink-soft">
            {state.data.message ||
              "Your deposit is confirmed. We'll contact you within 24 hours for business details, then get to work. Customizations are included."}
          </p>

          <dl className="mt-6 space-y-2 rounded-xl border border-subtle bg-surface-sunken p-4 text-left text-meta">
            {state.data.customer_name ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Name</dt>
                <dd className="font-medium text-ink">{state.data.customer_name}</dd>
              </div>
            ) : null}
            {state.data.template ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Layout</dt>
                <dd className="font-medium text-ink">{state.data.template}</dd>
              </div>
            ) : null}
            {state.data.deposit_label ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Deposit paid</dt>
                <dd className="font-semibold text-emerald-deep">{state.data.deposit_label}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Reference</dt>
              <dd className="font-mono text-xs text-ink">{txRef}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className={primaryBtn}>
              <FiHome aria-hidden="true" />
              Browse more layouts
            </Link>
            <a href={hubHref('track-order')} className={secondaryBtn}>
              Track order status
            </a>
            <a href={siteConfig.whatsapp} target="_blank" rel="noreferrer" className={secondaryBtn}>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (state.data?.status === 'pending') {
    return (
      <div className="mx-auto max-w-lg bg-surface-base px-6 py-12">
        <div className="rounded-xl border border-status-warning/30 bg-status-warning-surface p-8 text-center">
          <FiClock className="mx-auto mb-4 h-12 w-12 text-status-warning" aria-hidden="true" />
          <h1 className="font-display text-display-card text-emerald-deep">Payment processing</h1>
          <p className="mt-3 text-meta text-ink-soft">
            {state.data.message || 'Your payment is still being confirmed. This usually takes under a minute.'}
          </p>
          <p className="mt-2 font-mono text-xs text-ink-soft">Ref: {txRef}</p>
          <button type="button" onClick={verifyPayment} className={`${primaryBtn} mt-6`}>
            <FiRefreshCw aria-hidden="true" />
            Check again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg bg-surface-base px-6 py-12">
      <div className="rounded-xl border border-status-danger/25 bg-status-danger-surface p-8 text-center">
        <FiXCircle className="mx-auto mb-4 h-12 w-12 text-status-danger" aria-hidden="true" />
        <h1 className="font-display text-display-card text-emerald-deep">We could not confirm payment</h1>
        <p className="mt-3 text-meta text-ink-soft">
          {state.error || 'If you were charged, contact us with your payment reference.'}
        </p>
        {txRef ? <p className="mt-2 font-mono text-xs text-ink-soft">Ref: {txRef}</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={verifyPayment} className={primaryBtn}>
            <FiRefreshCw aria-hidden="true" />
            Retry verification
          </button>
          <Link to="/order" className={secondaryBtn}>
            Back to order
          </Link>
        </div>
      </div>
    </div>
  )
}
