import { useId, useState } from 'react'
import { FiArrowRight, FiCheck, FiSearch } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import PhoneInput from '../components/forms/PhoneInput'
import { defaultDialCode } from '../components/forms/CountrySelect'
import { apiEndpoints } from '../site.config'
import { useSiteConfig } from '../context/SiteContactContext'
import { usePageTitle } from '../lib/usePageTitle'
import { cn } from '../lib/utils'

const empty = {
  reference: '',
  dialCode: defaultDialCode,
  phone: '',
}

/**
 * Track order — short task form with inline errors (Wave 9 Phase C).
 * Not multi-step theatre; proportionate to lookup.
 */
export default function TrackOrderPage() {
  usePageTitle('Track order')
  const siteConfig = useSiteConfig()
  const formId = useId()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      const next = { ...e }
      delete next[key]
      return next
    })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.reference.trim()) next.reference = 'Enter your payment reference.'
    if (!form.phone.trim()) next.phone = 'Enter the phone number used when ordering.'
    setErrors(next)
    if (Object.keys(next).length) {
      setFormError('Fix the highlighted fields to look up your order.')
      return
    }

    setLoading(true)
    setOrder(null)
    setFormError('')
    try {
      const response = await fetch(apiEndpoints.orderStatus, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: form.reference.trim(),
          phone: form.phone.trim(),
          countryCode: form.dialCode,
        }),
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setOrder(result.order)
        return
      }

      setFormError(result.message || 'Could not find your order. Check the reference and phone, then try again.')
    } catch (err) {
      console.error(err)
      setFormError('Something went wrong. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setOrder(null)
    setForm(empty)
    setErrors({})
    setFormError('')
  }

  return (
    <>
      <PageHeader
        eyebrow="Client portal"
        title="Track your order"
        intro="Enter your payment reference and the phone number used at checkout to see deposit status and next steps."
      />

      <section className="section-light">
        <div className="mx-auto max-w-xl px-6 lg:px-10">
          <div className="rounded-xl border border-subtle bg-surface-raised p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-semibold text-emerald-deep">{order ? 'Your order status' : 'Look up your order'}</h2>
            <p className="mt-1 text-meta text-ink-soft">
              Reference usually starts with <span className="font-mono text-ink">ULN-</span>
            </p>

            {!order ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                {formError ? (
                  <div
                    role="alert"
                    className="rounded-dos-xl border border-status-danger/25 bg-status-danger-surface px-4 py-3 text-sm text-status-danger"
                  >
                    {formError}
                  </div>
                ) : null}

                <div>
                  <label htmlFor={`${formId}-ref`} className="block text-meta font-semibold text-emerald-deep">
                    Payment reference
                  </label>
                  <p id={`${formId}-ref-hint`} className="mt-1 text-sm text-content-muted">
                    From your payment confirmation or invoice.
                  </p>
                  <input
                    id={`${formId}-ref`}
                    type="text"
                    value={form.reference}
                    onChange={(e) => setField('reference', e.target.value)}
                    aria-invalid={errors.reference ? true : undefined}
                    aria-describedby={[`${formId}-ref-hint`, errors.reference ? `${formId}-ref-error` : null]
                      .filter(Boolean)
                      .join(' ')}
                    placeholder="ULN-…"
                    className={cn('field-input mt-2 font-mono text-sm', errors.reference && 'field-input-error')}
                  />
                  {errors.reference ? (
                    <p id={`${formId}-ref-error`} className="mt-2 text-sm text-status-danger">
                      {errors.reference}
                    </p>
                  ) : null}
                </div>

                <div>
                  <PhoneInput
                    dialCode={form.dialCode}
                    phone={form.phone}
                    onDialCodeChange={(dialCode) => setField('dialCode', dialCode)}
                    onPhoneChange={(phone) => setField('phone', phone)}
                    phoneId={`${formId}-phone`}
                    dialId={`${formId}-dial`}
                    describedBy={errors.phone ? `${formId}-phone-error` : undefined}
                    invalid={Boolean(errors.phone)}
                  />
                  {errors.phone ? (
                    <p id={`${formId}-phone-error`} className="mt-2 text-sm text-status-danger">
                      {errors.phone}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-action-primary-hover px-6 text-meta font-semibold text-cream transition duration-fast ease-dos hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  <FiSearch aria-hidden="true" />
                  {loading ? 'Looking up…' : 'Track my order'}
                  {!loading ? <FiArrowRight aria-hidden="true" /> : null}
                </button>
              </form>
            ) : (
              <div className="mt-8 space-y-6">
                <div
                  className="rounded-dos-xl border border-status-success/25 bg-status-success-surface p-5"
                  role="status"
                >
                  <p className="text-meta font-semibold text-status-success">{order.status_label}</p>
                  <h3 className="mt-1 display-card text-emerald-deep">{order.headline}</h3>
                  <p className="mt-2 text-body text-ink-soft">{order.next_step}</p>
                </div>

                <dl className="grid gap-3 rounded-dos-xl bg-surface-sunken p-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-content-muted">Reference</dt>
                    <dd className="font-mono font-medium text-ink">{order.reference}</dd>
                  </div>
                  <div>
                    <dt className="text-content-muted">Layout</dt>
                    <dd className="font-medium text-ink">{order.template}</dd>
                  </div>
                  <div>
                    <dt className="text-content-muted">Package</dt>
                    <dd className="font-medium text-ink">{order.package_title}</dd>
                  </div>
                  <div>
                    <dt className="text-content-muted">Deposit</dt>
                    <dd className="font-semibold text-emerald-deep">{order.deposit_label}</dd>
                  </div>
                </dl>

                <div>
                  <h4 className="mb-4 text-meta font-semibold uppercase tracking-wide text-content-muted">Progress</h4>
                  <ol className="space-y-3">
                    {order.timeline?.map((step, index) => (
                      <li key={step.id} className="flex items-start gap-3">
                        <span
                          className={cn(
                            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            step.done ? 'bg-action-primary-hover text-cream' : 'bg-surface-sunken text-content-muted',
                          )}
                        >
                          {step.done ? <FiCheck className="h-4 w-4" aria-hidden="true" /> : index + 1}
                        </span>
                        <span className={step.done ? 'font-medium text-ink' : 'text-content-muted'}>{step.label}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={reset}
                    className="min-h-11 rounded-full border border-subtle px-5 text-meta font-semibold text-ink-soft transition hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                  >
                    Look up another order
                  </button>
                  <a
                    href={siteConfig.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-action-primary-hover px-5 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                  >
                    Chat with support
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
