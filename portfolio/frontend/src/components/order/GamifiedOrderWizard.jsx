import { useEffect, useId, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock } from 'react-icons/fi'
import { apiEndpoints } from '../../site.config'
import { formatUgx, getPlanById, pricingPlans } from '../../config/packages'
import { orderCountries, wizardSteps } from './orderWizardConfig'

const emptyForm = {
  websiteName: '',
  template: '',
  phone: '',
  countryCode: '+256',
  country: 'UG',
  fullName: '',
  email: '',
  businessName: '',
  notes: '',
  package: 'smart',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_LABELS = {
  package: 'Package',
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  websiteName: 'Layout / website name',
}

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/**
 * Layout order wizard — guided steps with field-level errors, announced progress,
 * and review-before-pay (Wave 9 Phase C).
 */
export default function GamifiedOrderWizard({ templateName = '', templateData = null }) {
  const formId = useId()
  const stepStatusId = `${formId}-step-status`
  const summaryRef = useRef(null)
  const stepHeadingRef = useRef(null)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    ...emptyForm,
    websiteName: templateName,
    template: templateName,
  })
  const [paying, setPaying] = useState(false)
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (!templateData?.name) return
    setForm((prev) => ({
      ...prev,
      template: templateData.name,
      websiteName: templateData.title || templateData.name,
    }))
  }, [templateData])

  useEffect(() => {
    queueMicrotask(() => stepHeadingRef.current?.focus())
  }, [step])

  const currentStep = wizardSteps[step]
  const selectedPlan = getPlanById(form.package)
  const progress = useMemo(() => Math.round(((step + 1) / wizardSteps.length) * 100), [step])

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const handleCountryChange = (code) => {
    const country = orderCountries.find((item) => item.code === code)
    if (!country) return
    setForm((prev) => ({
      ...prev,
      country: country.code,
      countryCode: country.dial,
      phone: '',
    }))
  }

  const validateFieldsFor = (stepId) => {
    const next = {}
    if (stepId === 'package' && !form.package) next.package = 'Choose a package to continue.'
    if (stepId === 'contact') {
      if (!form.fullName.trim()) next.fullName = 'Enter your full name.'
      if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.'
      if (!form.phone.trim()) next.phone = 'Enter your phone number.'
    }
    if (stepId === 'project' && !form.websiteName.trim()) {
      next.websiteName = 'Enter a layout or website name.'
    }
    return next
  }

  const validateStepFields = (stepId = currentStep.id) => {
    if (stepId === 'pay') {
      return {
        ...validateFieldsFor('package'),
        ...validateFieldsFor('contact'),
        ...validateFieldsFor('project'),
      }
    }
    return validateFieldsFor(stepId)
  }

  const goNext = () => {
    setAttempted(true)
    const nextErrors = validateStepFields()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      queueMicrotask(() => summaryRef.current?.focus())
      return
    }
    setAttempted(false)
    if (step < wizardSteps.length - 1) setStep((value) => value + 1)
  }

  const goBack = () => {
    if (step > 0) {
      setAttempted(false)
      setErrors({})
      setStep((value) => value - 1)
    }
  }

  const goToStep = (index) => {
    if (index < 0 || index >= step) return
    setAttempted(false)
    setErrors({})
    setStep(index)
  }

  const startPayment = async () => {
    setAttempted(true)
    const nextErrors = validateStepFields('pay')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0]
      const target = wizardSteps.findIndex((s) =>
        s.id === 'package'
          ? first === 'package'
          : s.id === 'contact'
            ? ['fullName', 'email', 'phone'].includes(first)
            : first === 'websiteName',
      )
      if (target >= 0) setStep(target)
      queueMicrotask(() => summaryRef.current?.focus())
      return
    }

    setPaying(true)
    try {
      const response = await fetch(apiEndpoints.paymentInit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          template: form.template || form.websiteName,
          websiteName: form.websiteName,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success && result.payment_link) {
        toast.success('Opening secure checkout…')
        window.location.href = result.payment_link
        return
      }

      toast.error(result.message || 'Could not start payment. Please try again.')
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  const requestQuoteOnly = async () => {
    setAttempted(true)
    const nextErrors = validateStepFields('pay')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      queueMicrotask(() => summaryRef.current?.focus())
      return
    }

    setQuoteSubmitting(true)
    try {
      const response = await fetch(apiEndpoints.order, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          template: form.template || form.websiteName,
          websiteName: form.websiteName,
        }),
      })
      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(result.message || 'Quote request sent. We will reply soon.')
        setForm({
          ...emptyForm,
          websiteName: templateName,
          template: templateName,
        })
        setStep(0)
        setErrors({})
        setAttempted(false)
      } else {
        toast.error(result.message || 'Could not submit quote request.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setQuoteSubmitting(false)
    }
  }

  const errorList = Object.keys(errors).map((id) => ({ id, message: errors[id] }))
  const inputClass = (id) =>
    cn(
      'mt-2 w-full min-h-11 rounded-xl border bg-surface-base px-4 py-3 text-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
      errors[id] && attempted ? 'border-status-danger/40' : 'border-subtle focus:border-emerald/40',
    )

  return (
    <div className="rounded-2xl border border-subtle bg-surface-raised p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p id={stepStatusId} className="text-meta font-semibold text-emerald-deep">
          Step {step + 1} of {wizardSteps.length}
          <span className="font-normal text-content-muted"> — {currentStep.title}</span>
        </p>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="mt-2 font-display text-display-card text-emerald-deep outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          {currentStep.title}
        </h2>
        <p className="mt-1 text-meta text-ink-soft">{currentStep.subtitle}</p>
      </div>

      <div
        className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-labelledby={stepStatusId}
      >
        <div className="h-full rounded-full bg-action-primary-hover transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      {attempted && errorList.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-xl border border-status-danger/25 bg-status-danger-surface px-4 py-3 text-sm text-status-danger outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          <p className="font-semibold">
            Fix {errorList.length} item{errorList.length === 1 ? '' : 's'} before continuing
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorList.map((item) => (
              <li key={item.id}>
                <span className="font-semibold">{FIELD_LABELS[item.id] || item.id}</span> — {item.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {templateData && step === 0 ? (
        <div className="mb-6 overflow-hidden rounded-xl border border-subtle bg-surface-sunken">
          <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
            <img
              src={templateData.mainImage}
              alt=""
              className="h-24 w-full rounded-lg object-cover"
            />
            <div>
              <p className="text-meta font-semibold uppercase tracking-wide text-emerald-deep">Selected layout</p>
              <h3 className="font-semibold text-ink">{templateData.title}</h3>
              <p className="mt-1 line-clamp-2 text-meta text-ink-soft">{templateData.description}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-h-[240px]">
        {currentStep.id === 'package' ? (
          <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Launch package">
            {pricingPlans.map((plan) => {
              const selected = form.package === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => updateField('package', plan.id)}
                  className={cn(
                    'relative rounded-xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                    selected
                      ? 'border-emerald bg-emerald-deep/5 shadow-sm'
                      : 'border-subtle hover:border-emerald/30',
                  )}
                >
                  {plan.badge === 'popular' ? (
                    <span className="absolute -top-2 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                      Popular
                    </span>
                  ) : null}
                  {plan.badge === 'best-value' ? (
                    <span className="absolute -top-2 right-3 rounded-full bg-obsidian px-2 py-0.5 text-[10px] font-bold uppercase text-cream">
                      Best value
                    </span>
                  ) : null}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-ink">{plan.title}</h4>
                      <p className="mt-1 text-lg font-bold text-emerald-deep">{formatUgx(plan.priceUgx)}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        Deposit today:{' '}
                        <span className="font-semibold text-ink">{formatUgx(plan.depositUgx)}</span>
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2',
                        selected ? 'border-emerald bg-emerald text-cream' : 'border-subtle',
                      )}
                    >
                      {selected ? <FiCheck className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : null}

        {currentStep.id === 'contact' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={`${formId}-name`} className="block text-meta font-semibold text-emerald-deep">
                Full name
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                aria-invalid={errors.fullName ? true : undefined}
                className={inputClass('fullName')}
              />
              {errors.fullName && attempted ? (
                <p className="mt-2 text-sm text-status-danger">{errors.fullName}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${formId}-email`} className="block text-meta font-semibold text-emerald-deep">
                Email
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                className={inputClass('email')}
              />
              {errors.email && attempted ? (
                <p className="mt-2 text-sm text-status-danger">{errors.email}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${formId}-phone`} className="block text-meta font-semibold text-emerald-deep">
                Phone
              </label>
              <div className="mt-2 flex gap-2">
                <select
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  aria-label="Country dial code"
                  className="min-h-11 w-28 rounded-xl border border-subtle bg-surface-base px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  {orderCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  className={cn(inputClass('phone'), 'mt-0 flex-1')}
                />
              </div>
              {errors.phone && attempted ? (
                <p className="mt-2 text-sm text-status-danger">{errors.phone}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${formId}-biz`} className="block text-meta font-semibold text-emerald-deep">
                Business name <span className="font-normal text-content-muted">(optional)</span>
              </label>
              <input
                id={`${formId}-biz`}
                type="text"
                value={form.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                className={inputClass('businessName')}
              />
            </div>
          </div>
        ) : null}

        {currentStep.id === 'project' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={`${formId}-site`} className="block text-meta font-semibold text-emerald-deep">
                Layout / website name
              </label>
              <input
                id={`${formId}-site`}
                type="text"
                value={form.websiteName}
                onChange={(e) => {
                  updateField('websiteName', e.target.value)
                  updateField('template', e.target.value)
                }}
                disabled={!!templateName}
                aria-invalid={errors.websiteName ? true : undefined}
                className={cn(inputClass('websiteName'), 'disabled:bg-surface-sunken')}
              />
              {errors.websiteName && attempted ? (
                <p className="mt-2 text-sm text-status-danger">{errors.websiteName}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${formId}-notes`} className="block text-meta font-semibold text-emerald-deep">
                Notes or custom requests <span className="font-normal text-content-muted">(optional)</span>
              </label>
              <textarea
                id={`${formId}-notes`}
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                className={cn(inputClass('notes'), 'min-h-[7rem] resize-y')}
              />
            </div>
          </div>
        ) : null}

        {currentStep.id === 'pay' ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-subtle bg-surface-sunken p-5">
              <h3 className="font-semibold text-ink">Order summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  { step: 0, label: 'Package', value: selectedPlan?.title },
                  { step: 2, label: 'Layout', value: form.websiteName },
                  { step: 1, label: 'Name', value: form.fullName },
                  { step: 1, label: 'Email', value: form.email },
                  { step: 1, label: 'Phone', value: `${form.countryCode}${form.phone}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
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
                <div className="flex justify-between gap-4 border-t border-subtle pt-3">
                  <dt className="font-semibold text-ink">Deposit due now</dt>
                  <dd className="text-lg font-bold text-emerald-deep">{formatUgx(selectedPlan.depositUgx)}</dd>
                </div>
              </dl>
            </div>

            <p className="rounded-xl border border-subtle bg-surface-raised p-4 text-sm text-ink-soft">
              Pay your deposit with MTN MoMo, Airtel Money, card, or bank transfer via Flutterwave. After payment we
              contact you for business details and start building.
            </p>

            <button
              type="button"
              onClick={startPayment}
              disabled={paying || quoteSubmitting}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-action-primary-hover px-6 py-3 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-60"
            >
              <FiLock className="h-5 w-5" aria-hidden="true" />
              {paying ? 'Opening Flutterwave…' : `Pay ${formatUgx(selectedPlan.depositUgx)} & start build`}
            </button>

            <button
              type="button"
              onClick={requestQuoteOnly}
              disabled={quoteSubmitting || paying}
              className="w-full text-center text-sm font-medium text-ink-soft underline-offset-2 hover:text-emerald-deep hover:underline disabled:opacity-60"
            >
              {quoteSubmitting ? 'Sending quote request…' : 'Skip payment — request a quote only'}
            </button>
          </div>
        ) : null}
      </div>

      {currentStep.id !== 'pay' ? (
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-subtle pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-meta font-semibold text-ink-soft hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-40"
          >
            <FiArrowLeft aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-action-primary-hover px-5 text-meta font-semibold text-cream hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Continue
            <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-6 border-t border-subtle pt-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 items-center gap-2 text-meta font-semibold text-ink-soft hover:text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            <FiArrowLeft aria-hidden="true" />
            Edit previous steps
          </button>
        </div>
      )}
    </div>
  )
}
