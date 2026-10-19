/**
 * MoMo pay step — amount, payer, provider instructions, claim CTA.
 * Design OS: checkout + multi_step_form · UX-GATE C1
 * Absolute: claim ≠ paid; no MoMo tx ref; codes from API only.
 */

import { useEffect, useState } from 'react'
import { FiCopy, FiLock, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiEndpoints } from '../../site.config'
import { formatUgx } from '../../config/packages'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function PayStep({
  formId,
  form,
  selectedPlan,
  goToStep,
  onClaimSuccess,
  quoteSubmitting,
  onRequestQuote,
  disabled = false,
}) {
  const [providers, setProviders] = useState([])
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState('')
  const [unavailable, setUnavailable] = useState(false)
  const [provider, setProvider] = useState('')
  const [payerIsCustomer, setPayerIsCustomer] = useState(true)
  const [payerName, setPayerName] = useState('')
  const [payerPhone, setPayerPhone] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [claiming, setClaiming] = useState(false)

  const loadProviders = async () => {
    setConfigLoading(true)
    setConfigError('')
    try {
      const res = await fetch(apiEndpoints.paymentProviders, {
        headers: { Accept: 'application/json' },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Could not load payment options.')
      }
      const list = Array.isArray(data.providers) ? data.providers : []
      setProviders(list)
      setUnavailable(Boolean(data.unavailable) || list.length === 0)
      if (list.length === 1) setProvider(list[0].provider)
      else if (list.length > 1 && !list.some((p) => p.provider === provider)) {
        setProvider(list[0].provider)
      }
    } catch (err) {
      setConfigError(err?.message || 'Could not load payment options.')
      setProviders([])
      setUnavailable(true)
    } finally {
      setConfigLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, [])

  const selected = providers.find((p) => p.provider === provider) || null

  const copyText = async (label, value) => {
    try {
      await navigator.clipboard.writeText(String(value))
      toast.success(`${label} copied`)
    } catch {
      toast.error('Could not copy. Select and copy manually.')
    }
  }

  const submitClaim = async () => {
    const next = {}
    if (!provider) next.provider = 'Choose MTN or Airtel.'
    if (!payerIsCustomer) {
      if (!payerName.trim()) next.payerName = 'Enter the payer’s name.'
      if (!payerPhone.trim()) next.payerPhone = 'Enter the payer’s Mobile Money number.'
    }
    setFieldErrors(next)
    if (Object.keys(next).length) return

    setClaiming(true)
    try {
      const response = await fetch(apiEndpoints.paymentClaim, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          template: form.template || form.websiteName,
          websiteName: form.websiteName,
          provider,
          payerIsCustomer,
          payerName: payerIsCustomer ? undefined : payerName.trim(),
          payerPhone: payerIsCustomer ? undefined : payerPhone.trim(),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.ok && result.success && result.claim_ref) {
        onClaimSuccess(result)
        return
      }
      toast.error(result.message || 'Could not submit your claim. Please try again.')
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  const busy = claiming || quoteSubmitting || disabled

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-subtle bg-surface-sunken p-5">
        <p className="text-meta text-content-muted">Amount due</p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-emerald-deep sm:text-4xl">
          {formatUgx(selectedPlan.depositUgx)}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {selectedPlan?.title} · deposit
        </p>
        <dl className="mt-4 space-y-2 border-t border-subtle pt-4 text-sm">
          {[
            { step: 0, label: 'Package', value: selectedPlan?.title },
            { step: 2, label: 'Layout', value: form.websiteName },
            { step: 1, label: 'Contact', value: form.fullName },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-3">
              <div>
                <dt className="text-content-muted">{row.label}</dt>
                <dd className="font-medium text-ink">{row.value || '—'}</dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(row.step)}
                className="shrink-0 text-meta font-semibold text-emerald-deep underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Edit
              </button>
            </div>
          ))}
        </dl>
      </div>

      {configLoading ? (
        <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading payment options">
          <div className="h-12 rounded-xl bg-surface-sunken" />
          <div className="h-28 rounded-xl bg-surface-sunken" />
        </div>
      ) : null}

      {configError ? (
        <div className="rounded-xl border border-status-danger/30 bg-status-danger/5 p-4 text-sm" role="alert">
          <p className="font-medium text-status-danger">{configError}</p>
          <button
            type="button"
            onClick={loadProviders}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-subtle bg-surface-raised px-4 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            <FiRefreshCw aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}

      {!configLoading && !configError && unavailable ? (
        <div className="rounded-xl border border-subtle bg-surface-raised p-4 text-sm text-ink-soft" role="status">
          Payments are temporarily unavailable. Request a quote or contact us — we will help you pay another way.
        </div>
      ) : null}

      {!configLoading && !configError && !unavailable ? (
        <>
          <fieldset>
            <legend className="text-meta font-semibold text-emerald-deep">Who is paying?</legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { value: true, label: 'Me' },
                { value: false, label: 'Someone else' },
              ].map((opt) => (
                <label
                  key={String(opt.value)}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition',
                    payerIsCustomer === opt.value
                      ? 'border-emerald bg-surface-raised text-ink'
                      : 'border-subtle bg-surface-sunken text-ink-soft hover:border-emerald/40',
                  )}
                >
                  <input
                    type="radio"
                    name={`${formId}-payer`}
                    className="sr-only"
                    checked={payerIsCustomer === opt.value}
                    onChange={() => setPayerIsCustomer(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {!payerIsCustomer ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${formId}-payer-name`} className="block text-meta font-semibold text-emerald-deep">
                  Payer name
                </label>
                <input
                  id={`${formId}-payer-name`}
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className={cn('field-input mt-2', fieldErrors.payerName && 'field-input-error')}
                  autoComplete="name"
                />
                {fieldErrors.payerName ? (
                  <p className="mt-1 text-sm text-status-danger" role="alert">
                    {fieldErrors.payerName}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor={`${formId}-payer-phone`} className="block text-meta font-semibold text-emerald-deep">
                  Payer MoMo phone
                </label>
                <input
                  id={`${formId}-payer-phone`}
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className={cn('field-input mt-2', fieldErrors.payerPhone && 'field-input-error')}
                  inputMode="tel"
                  autoComplete="tel"
                />
                {fieldErrors.payerPhone ? (
                  <p className="mt-1 text-sm text-status-danger" role="alert">
                    {fieldErrors.payerPhone}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <fieldset>
            <legend className="text-meta font-semibold text-emerald-deep">Pay with</legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {providers.map((p) => (
                <button
                  key={p.provider}
                  type="button"
                  onClick={() => setProvider(p.provider)}
                  className={cn(
                    'min-h-11 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                    provider === p.provider
                      ? 'border-emerald bg-surface-raised text-ink'
                      : 'border-subtle bg-surface-sunken text-ink-soft hover:border-emerald/40',
                  )}
                  aria-pressed={provider === p.provider}
                >
                  {p.display_name}
                </button>
              ))}
            </div>
            {fieldErrors.provider ? (
              <p className="mt-2 text-sm text-status-danger" role="alert">
                {fieldErrors.provider}
              </p>
            ) : null}
          </fieldset>

          {selected ? (
            <div className="rounded-xl border border-subtle bg-surface-raised p-4 sm:p-5">
              <h3 className="font-semibold text-ink">Payment instructions</h3>
              <p className="mt-2 text-sm text-ink-soft">{selected.payment_instructions}</p>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-sunken px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
                      {selected.provider === 'mtn' ? 'Merchant code' : 'Merchant number'}
                    </p>
                    <p className="font-mono text-lg font-semibold text-emerald-deep">
                      {selected.merchant_identifier}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        selected.provider === 'mtn' ? 'Merchant code' : 'Merchant number',
                        selected.merchant_identifier,
                      )
                    }
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-subtle bg-surface-raised px-3 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                  >
                    <FiCopy aria-hidden="true" />
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-sunken px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Exact amount</p>
                    <p className="text-lg font-semibold text-ink">{formatUgx(selectedPlan.depositUgx)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText('Amount', String(selectedPlan.depositUgx))}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-subtle bg-surface-raised px-3 text-meta font-semibold text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                  >
                    <FiCopy aria-hidden="true" />
                    Copy
                  </button>
                </div>
                {selected.ussd_instruction ? (
                  <p className="text-sm text-ink-soft">{selected.ussd_instruction}</p>
                ) : null}
                <p className="text-sm font-medium text-ink">Send the exact amount. You do not need a transaction reference.</p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={submitClaim}
            disabled={busy || !selected}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-action-primary-hover px-6 py-3 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-60"
          >
            <FiLock className="h-5 w-5" aria-hidden="true" />
            {claiming ? 'Submitting…' : "I've completed payment"}
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={onRequestQuote}
        disabled={busy}
        className="w-full text-center text-sm font-medium text-ink-soft underline-offset-2 hover:text-emerald-deep hover:underline disabled:opacity-60"
      >
        {quoteSubmitting ? 'Sending quote request…' : 'Request a quote instead'}
      </button>
    </div>
  )
}
