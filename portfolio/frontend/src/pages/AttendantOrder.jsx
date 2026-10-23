/**
 * Sleekly Attendant Uganda order — business → contact → review → MoMo claim.
 * Isolated from website deposit wizard. No usage quota on review.
 */

import { useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import PayStep from '../components/order/PayStep'
import { orderCountries } from '../components/order/orderWizardConfig'
import { attendantSubscription } from '../config/attendantSubscription'
import { formatUgx } from '../config/packages'
import { hubHref } from '../site.config'

const STEPS = [
  { id: 'business', title: 'Your business', subtitle: 'Website optional — we can deliver a hosted link' },
  { id: 'contact', title: 'Your contact details', subtitle: 'So we can verify payment and set up with you' },
  { id: 'review', title: 'Review your plan', subtitle: 'First month · manual monthly renewals' },
  { id: 'pay', title: 'Pay first month', subtitle: 'MTN Mobile Money or Airtel Money' },
]

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

const initialForm = {
  businessName: '',
  websiteUrl: '',
  needsHostedLink: false,
  fullName: '',
  email: '',
  phone: '',
  countryCode: '+256',
  notes: '',
}

export default function AttendantOrder() {
  const formId = useId()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)

  const current = STEPS[step]
  const product = attendantSubscription

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (stepId) => {
    const next = {}
    if (stepId === 'business') {
      if (!form.businessName.trim()) next.businessName = 'Enter your business name.'
      if (!form.needsHostedLink && form.websiteUrl.trim()) {
        const url = form.websiteUrl.trim()
        if (url.length < 4) next.websiteUrl = 'Enter a full website address, or choose hosted link.'
      }
    }
    if (stepId === 'contact') {
      if (!form.fullName.trim()) next.fullName = 'Enter your full name.'
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        next.email = 'Enter a valid email.'
      }
      if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 9) {
        next.phone = 'Enter a valid phone number.'
      }
    }
    return next
  }

  const goNext = () => {
    setAttempted(true)
    const nextErrors = validate(current.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setAttempted(false)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setAttempted(false)
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
  }

  const goToStep = (index) => {
    if (index < 0 || index >= step) return
    setAttempted(false)
    setErrors({})
    setStep(index)
  }

  const handleClaimSuccess = (result) => {
    toast.success(result.message || 'We’ve got your payment claim.')
    navigate(
      `/order/claim?ref=${encodeURIComponent(result.claim_ref)}&phone=${encodeURIComponent(form.phone)}&product=attendant`,
    )
  }

  const buildClaimBody = (payerFields) => ({
    product: product.id,
    package: product.id,
    businessName: form.businessName.trim(),
    websiteUrl: form.needsHostedLink ? '' : form.websiteUrl.trim(),
    needsHostedLink: form.needsHostedLink || !form.websiteUrl.trim(),
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    countryCode: form.countryCode,
    notes: form.notes.trim() || undefined,
    ...payerFields,
  })

  const summaryRows = useMemo(
    () => [
      { step: 0, label: 'Business', value: form.businessName },
      {
        step: 0,
        label: 'Website',
        value: form.needsHostedLink || !form.websiteUrl.trim() ? 'Hosted link' : form.websiteUrl,
      },
      { step: 1, label: 'Contact', value: form.fullName },
    ],
    [form.businessName, form.needsHostedLink, form.websiteUrl, form.fullName],
  )

  const fieldClass = (key) =>
    cn('field-input mt-2', attempted && errors[key] && 'field-input-error')

  return (
    <div className="bg-surface-base py-10 max-lg:pb-24 md:py-14">
      <div className="mx-auto max-w-content space-y-10 px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Sleekly Attendant</p>
          <h1 className="mt-3 font-display text-display-section text-emerald-deep">
            Set up your AI attendant
          </h1>
          <p className="mt-4 text-body text-ink-soft">
            Pay the first month ({formatUgx(product.amountUgx)}) with MTN or Airtel Money. After we verify
            payment, we contact you to collect business details and begin setup. {product.renewalsNote}
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 lg:max-w-content lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <div className="rounded-dos-xl border border-subtle bg-surface-raised p-6 shadow-sm sm:p-8">
            <ol className="mb-8 flex flex-wrap gap-2" aria-label="Order steps">
              {STEPS.map((item, index) => {
                const active = index === step
                const done = index < step
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={index > step}
                      onClick={() => goToStep(index)}
                      className={cn(
                        'min-h-11 rounded-dos-lg px-3 py-2 text-meta font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-40',
                        active
                          ? 'bg-action-primary-hover text-cream'
                          : done
                            ? 'bg-surface-sunken text-emerald-deep'
                            : 'text-content-muted',
                      )}
                    >
                      {index + 1}. {item.title}
                    </button>
                  </li>
                )
              })}
            </ol>

            <header className="mb-6">
              <h2 className="font-display text-display-card text-emerald-deep">{current.title}</h2>
              <p className="mt-2 text-meta text-ink-soft">{current.subtitle}</p>
            </header>

            {current.id === 'business' ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor={`${formId}-business`} className="block text-meta font-semibold text-emerald-deep">
                    Business name
                  </label>
                  <input
                    id={`${formId}-business`}
                    value={form.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    className={fieldClass('businessName')}
                    autoComplete="organization"
                  />
                  {attempted && errors.businessName ? (
                    <p className="mt-1 text-sm text-status-danger" role="alert">
                      {errors.businessName}
                    </p>
                  ) : null}
                </div>

                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-subtle bg-surface-sunken px-4 py-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-subtle text-emerald focus:ring-dos"
                    checked={form.needsHostedLink}
                    onChange={(e) => {
                      updateField('needsHostedLink', e.target.checked)
                      if (e.target.checked) updateField('websiteUrl', '')
                    }}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      No website yet — I need a hosted attendant link
                    </span>
                    <span className="mt-1 block text-meta text-ink-soft">
                      We deliver a shareable or embeddable link after setup.
                    </span>
                  </span>
                </label>

                {!form.needsHostedLink ? (
                  <div>
                    <label htmlFor={`${formId}-website`} className="block text-meta font-semibold text-emerald-deep">
                      Website URL <span className="font-normal text-content-muted">(optional)</span>
                    </label>
                    <input
                      id={`${formId}-website`}
                      value={form.websiteUrl}
                      onChange={(e) => updateField('websiteUrl', e.target.value)}
                      className={fieldClass('websiteUrl')}
                      placeholder="https://"
                      inputMode="url"
                      autoComplete="url"
                    />
                    {attempted && errors.websiteUrl ? (
                      <p className="mt-1 text-sm text-status-danger" role="alert">
                        {errors.websiteUrl}
                      </p>
                    ) : (
                      <p className="mt-1 text-meta text-content-muted">
                        Leave blank if you are still deciding — we will confirm during onboarding.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {current.id === 'contact' ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor={`${formId}-name`} className="block text-meta font-semibold text-emerald-deep">
                    Full name
                  </label>
                  <input
                    id={`${formId}-name`}
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={fieldClass('fullName')}
                    autoComplete="name"
                  />
                  {attempted && errors.fullName ? (
                    <p className="mt-1 text-sm text-status-danger" role="alert">
                      {errors.fullName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor={`${formId}-email`} className="block text-meta font-semibold text-emerald-deep">
                    Email
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={fieldClass('email')}
                    autoComplete="email"
                  />
                  {attempted && errors.email ? (
                    <p className="mt-1 text-sm text-status-danger" role="alert">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-[7rem_1fr]">
                  <div>
                    <label htmlFor={`${formId}-cc`} className="block text-meta font-semibold text-emerald-deep">
                      Code
                    </label>
                    <select
                      id={`${formId}-cc`}
                      value={form.countryCode}
                      onChange={(e) => updateField('countryCode', e.target.value)}
                      className="field-input mt-2"
                    >
                      {orderCountries.map((c) => (
                        <option key={c.code} value={c.dial}>
                          {c.dial}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`${formId}-phone`} className="block text-meta font-semibold text-emerald-deep">
                      Phone
                    </label>
                    <input
                      id={`${formId}-phone`}
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={fieldClass('phone')}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                    {attempted && errors.phone ? (
                      <p className="mt-1 text-sm text-status-danger" role="alert">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label htmlFor={`${formId}-notes`} className="block text-meta font-semibold text-emerald-deep">
                    Notes <span className="font-normal text-content-muted">(optional)</span>
                  </label>
                  <textarea
                    id={`${formId}-notes`}
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="field-input mt-2 min-h-[5rem] resize-y"
                  />
                </div>
              </div>
            ) : null}

            {current.id === 'review' ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald/25 bg-surface-sunken p-5">
                  <p className="text-meta text-content-muted">{product.shortTitle}</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-emerald-deep">
                    {formatUgx(product.amountUgx)}
                    <span className="ml-2 text-base font-normal text-ink-soft">/ first month</span>
                  </p>
                  <p className="mt-3 text-sm text-ink-soft">{product.renewalsNote}</p>
                  <p className="mt-2 text-sm text-ink-soft">{product.usageNote}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-meta font-semibold uppercase tracking-wide text-content-muted">
                      Included
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {product.included.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-ink-soft">
                          <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-meta font-semibold uppercase tracking-wide text-content-muted">
                      Not included
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {product.exclusions.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-ink-soft">
                          <FiX className="mt-0.5 h-4 w-4 shrink-0 text-content-muted" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <dl className="space-y-2 border-t border-subtle pt-4 text-sm">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-3">
                      <dt className="text-content-muted">{row.label}</dt>
                      <dd className="font-medium text-ink">{row.value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {current.id === 'pay' ? (
              <PayStep
                formId={formId}
                form={form}
                amountUgx={product.amountUgx}
                productTitle={product.title}
                amountCaption={product.amountCaption}
                summaryRows={summaryRows}
                goToStep={goToStep}
                onClaimSuccess={handleClaimSuccess}
                buildClaimBody={buildClaimBody}
                hideQuoteRequest
              />
            ) : null}

            {current.id !== 'pay' ? (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-subtle pt-6">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex min-h-11 items-center gap-2 rounded-dos-lg px-4 text-meta font-semibold text-ink-soft hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-40"
                >
                  <FiArrowLeft aria-hidden="true" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex min-h-11 items-center gap-2 rounded-dos-lg bg-action-primary-hover px-5 text-meta font-semibold text-cream hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  {current.id === 'review' ? 'Continue to pay' : 'Continue'}
                  <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <section className="rounded-dos-xl border border-subtle bg-surface-raised p-6 shadow-sm">
              <h2 className="font-display text-display-card text-emerald-deep">What happens next</h2>
              <ol className="mt-5 space-y-4 text-meta text-ink-soft">
                {[
                  'Pay the first month with MTN or Airtel Money.',
                  'Tell us you’ve paid — we verify against our merchant account (claim is not marked paid yet).',
                  'We contact you to collect business details and set up your attendant.',
                ].map((text, i) => (
                  <li key={text} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-dos-md bg-action-primary-hover text-xs font-bold text-cream">
                      {i + 1}
                    </span>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-dos-xl border border-subtle bg-surface-sunken p-6">
              <h2 className="font-display text-display-card text-emerald-deep">Outside Uganda?</h2>
              <p className="mt-2 text-meta text-ink-soft">
                International buyers request an invoice — card checkout is not on this form.
              </p>
              <a
                href={hubHref('contact?intent=ai-attendant')}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-dos-lg border border-subtle bg-surface-raised px-5 text-meta font-semibold text-emerald-deep hover:bg-surface-base focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
              >
                Request setup & invoice
              </a>
            </section>

            <p className="text-center text-sm text-ink-soft">
              <Link
                to="/"
                className="font-semibold text-emerald-deep underline-offset-2 hover:underline"
              >
                Back to layouts
              </Link>
              {' · '}
              <a
                href={hubHref('products/attendant')}
                className="font-semibold text-emerald-deep underline-offset-2 hover:underline"
              >
                Product page
              </a>
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
