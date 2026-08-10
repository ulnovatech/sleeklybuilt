import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'
import PhoneInput from './PhoneInput'
import { defaultDialCode } from './CountrySelect'
import SubmissionConfirmation from '../site/SubmissionConfirmation'
import { apiEndpoints } from '../../site.config'
import { useSiteConfig } from '../../context/SiteContactContext'
import { contactIntents, intentFromSearchParam } from '../../config/contactIntents'
import { useFormSubmit } from '../../lib/useFormSubmit'
import { cn } from '../../lib/utils'

const DRAFT_KEY = 'sleeklybuilt-contact-draft'
const SUCCESS_KEY_PREFIX = 'sleeklybuilt-contact-ok:'

const STEPS = [
  { id: 'intent', label: 'About', fields: ['intentId', 'orderRef'] },
  { id: 'you', label: 'You', fields: ['name', 'phone', 'email'] },
  { id: 'brief', label: 'Brief', fields: ['message'] },
  { id: 'review', label: 'Review', fields: [] },
]

const empty = {
  intentId: '',
  orderRef: '',
  name: '',
  dialCode: defaultDialCode,
  phone: '',
  email: '',
  message: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_LABELS = {
  intentId: 'What this is about',
  orderRef: 'Order reference',
  name: 'Your name',
  phone: 'Phone number',
  email: 'Email address',
  message: 'Message',
}

function makeSubmissionKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `sk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeDraft(form, stepIndex) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, stepIndex, savedAt: Date.now() }))
  } catch {
    /* ignore quota */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

function fieldErrorMessage(id, form, selectedIntent) {
  switch (id) {
    case 'intentId':
      return form.intentId ? null : 'Choose what this message is about.'
    case 'orderRef':
      if (!selectedIntent?.extraField) return null
      return form.orderRef.trim() ? null : `Add your ${selectedIntent.extraField.label.toLowerCase()}.`
    case 'name':
      return form.name.trim() ? null : 'Enter your name.'
    case 'phone':
      return form.phone.trim() ? null : 'Enter your phone number.'
    case 'email':
      if (!form.email.trim()) return 'Enter your email address.'
      if (!EMAIL_RE.test(form.email.trim())) return 'Enter a valid email address.'
      return null
    case 'message':
      return form.message.trim() ? null : 'Tell us what you need in a short message.'
    default:
      return null
  }
}

/**
 * Guided contact enquiry — multi_step_form + contact patterns.
 * Steps: Intent → You → Brief → Review → Confirmation.
 * Preserves Phase 7 a11y: labels, 44px targets, blur validation, assertive summary, drafts.
 */
export default function GamifiedContactForm() {
  const siteConfig = useSiteConfig()
  const reducedMotion = useReducedMotion()
  const [searchParams] = useSearchParams()
  const formId = useId()
  const intentLegendId = `${formId}-intent-legend`
  const summaryId = `${formId}-error-summary`
  const stepStatusId = `${formId}-step-status`
  const errorSummaryRef = useRef(null)
  const stepHeadingRef = useRef(null)
  const fieldRefs = useRef({})

  const [submissionKey] = useState(() => makeSubmissionKey())
  const [form, setForm] = useState(empty)
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [hydrated, setHydrated] = useState(false)
  const [stepAttempted, setStepAttempted] = useState(false)
  const [microSuccess, setMicroSuccess] = useState('')

  const { submit, loading } = useFormSubmit({
    url: apiEndpoints.contact,
    successToast: false,
    onSuccess: (result) => {
      clearDraft()
      const reference = result.reference || `MSG-${Date.now().toString(36).toUpperCase()}`
      try {
        sessionStorage.setItem(
          `${SUCCESS_KEY_PREFIX}${submissionKey}`,
          JSON.stringify({ reference, email: form.email.trim() }),
        )
      } catch {
        /* ignore */
      }
      setDone({ reference, email: form.email.trim() })
    },
  })

  useEffect(() => {
    const fromUrl = intentFromSearchParam(searchParams.get('intent'))
    const cached = (() => {
      try {
        const raw = sessionStorage.getItem(`${SUCCESS_KEY_PREFIX}${submissionKey}`)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })()
    if (cached?.reference) {
      setDone(cached)
      setHydrated(true)
      return
    }

    const draft = readDraft()
    if (draft?.form) {
      setForm({
        ...empty,
        ...draft.form,
        intentId: fromUrl || draft.form.intentId || '',
      })
      if (typeof draft.stepIndex === 'number' && draft.stepIndex >= 0 && draft.stepIndex < STEPS.length) {
        setStepIndex(draft.stepIndex)
      }
    } else if (fromUrl) {
      setForm((f) => ({ ...f, intentId: fromUrl }))
    }
    setHydrated(true)
  }, [searchParams, submissionKey])

  useEffect(() => {
    if (!hydrated || done) return
    writeDraft(form, stepIndex)
  }, [form, stepIndex, hydrated, done])

  useEffect(() => {
    if (!hydrated || done) return
    queueMicrotask(() => stepHeadingRef.current?.focus())
  }, [stepIndex, hydrated, done])

  const selectedIntent = useMemo(
    () => contactIntents.find((item) => item.id === form.intentId) ?? null,
    [form.intentId],
  )

  const currentStep = STEPS[stepIndex]
  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  const stepFieldIds = useMemo(() => {
    return currentStep.fields.filter((id) => id !== 'orderRef' || Boolean(selectedIntent?.extraField))
  }, [currentStep, selectedIntent])

  const validateFields = (ids) => {
    const next = {}
    ids.forEach((id) => {
      const message = fieldErrorMessage(id, form, selectedIntent)
      if (message) next[id] = message
    })
    return next
  }

  const errorList = useMemo(
    () => stepFieldIds.filter((id) => errors[id]).map((id) => ({ id, message: errors[id] })),
    [stepFieldIds, errors],
  )

  const showSummary = stepAttempted && errorList.length > 0

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
    }
  }

  const handleBlur = (id) => {
    setTouched((t) => ({ ...t, [id]: true }))
    const message = fieldErrorMessage(id, form, selectedIntent)
    setErrors((current) => {
      const next = { ...current }
      if (message) next[id] = message
      else delete next[id]
      return next
    })
  }

  const focusField = (id) => {
    if (id === 'intentId') {
      document.querySelector(`input[name="${formId}-intent"]`)?.focus()
      return
    }
    fieldRefs.current[id]?.focus()
  }

  const announceSuccess = (label) => {
    setMicroSuccess(label)
    window.setTimeout(() => setMicroSuccess(''), reducedMotion ? 0 : 1600)
  }

  const goToStep = (index) => {
    if (index < 0 || index >= STEPS.length) return
    if (index > stepIndex) return
    setStepAttempted(false)
    setErrors({})
    setStepIndex(index)
  }

  const continueOrSubmit = async (event) => {
    event.preventDefault()
    setStepAttempted(true)

    if (currentStep.id !== 'review') {
      const nextErrors = validateFields(stepFieldIds)
      setErrors(nextErrors)
      setTouched((t) => {
        const all = { ...t }
        stepFieldIds.forEach((id) => {
          all[id] = true
        })
        return all
      })
      if (Object.keys(nextErrors).length > 0) {
        queueMicrotask(() => errorSummaryRef.current?.focus())
        return
      }
      announceSuccess(`${currentStep.label} saved`)
      setStepAttempted(false)
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
      return
    }

    const allIds = ['intentId', 'name', 'phone', 'email', 'message']
    if (selectedIntent?.extraField) allIds.splice(1, 0, 'orderRef')
    const nextErrors = validateFields(allIds)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0]
      const targetStep = STEPS.findIndex((s) => s.fields.includes(firstKey))
      if (targetStep >= 0) setStepIndex(targetStep)
      queueMicrotask(() => errorSummaryRef.current?.focus())
      return
    }

    let message = form.message.trim()
    if (selectedIntent?.extraField && form.orderRef.trim()) {
      message = `Order reference: ${form.orderRef.trim()}\n\n${message}`
    }

    try {
      await submit({
        name: form.name.trim(),
        phone: `${form.dialCode}${form.phone.trim()}`,
        email: form.email.trim(),
        subject: selectedIntent?.subject || 'General enquiry',
        message,
        intent: selectedIntent?.id || 'other',
        submission_key: submissionKey,
      })
    } catch {
      /* toast from useFormSubmit; draft preserved */
    }
  }

  const reset = () => {
    try {
      sessionStorage.removeItem(`${SUCCESS_KEY_PREFIX}${submissionKey}`)
    } catch {
      /* ignore */
    }
    clearDraft()
    setForm(empty)
    setDone(null)
    setErrors({})
    setTouched({})
    setStepAttempted(false)
    setStepIndex(0)
  }

  const inputClass = (id) =>
    cn(
      'mt-2 w-full min-h-11 rounded-dos-xl border bg-surface-base px-3 py-2.5 text-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
      errors[id] && (touched[id] || stepAttempted)
        ? 'border-status-danger/40'
        : 'border-subtle focus:border-action-primary/40',
    )

  const showError = (id) => Boolean(errors[id] && (touched[id] || stepAttempted))

  if (done) {
    return (
      <SubmissionConfirmation
        reference={done.reference}
        email={done.email}
        onSendAnother={reset}
        reducedMotion={reducedMotion}
      />
    )
  }

  const intentCopy = selectedIntent
    ? selectedIntent.id === 'project'
      ? 'Tell us what you want to build.'
      : selectedIntent.id === 'order'
        ? 'Share enough detail for us to find your order.'
        : 'A short note is enough — we will follow up.'
    : 'About two minutes. Your draft is saved on this device.'

  return (
    <div className="rounded-dos-xl border border-subtle bg-surface-raised p-6 shadow-sm sm:p-8">
      <div>
        <p className="eyebrow">Project enquiry</p>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="mt-2 display-card text-emerald-deep outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          {currentStep.id === 'intent' && 'What is this about?'}
          {currentStep.id === 'you' && 'How can we reach you?'}
          {currentStep.id === 'brief' && 'What do you need?'}
          {currentStep.id === 'review' && 'Review and send'}
        </h2>
        <p className="mt-2 text-body text-ink-soft">{intentCopy}</p>
      </div>

      <div className="mt-6" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p id={stepStatusId} className="text-meta font-semibold text-emerald-deep">
            Step {stepIndex + 1} of {STEPS.length}
            <span className="font-normal text-content-muted"> — {currentStep.label}</span>
          </p>
          <p className="text-meta tabular-nums text-content-muted">{progressPct}%</p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-labelledby={stepStatusId}
        >
          <div
            className={cn(
              'h-full rounded-full bg-action-primary-hover',
              !reducedMotion && 'transition-[width] duration-normal ease-dos',
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ol className="mt-4 flex flex-wrap gap-2" aria-label="Enquiry steps">
          {STEPS.map((step, index) => {
            const doneStep = index < stepIndex
            const current = index === stepIndex
            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={index > stepIndex}
                  onClick={() => goToStep(index)}
                  className={cn(
                    'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-meta font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:cursor-not-allowed disabled:opacity-45',
                    current && 'border-action-primary/40 bg-action-primary-hover/10 text-emerald-deep',
                    doneStep && 'border-subtle bg-surface-sunken text-ink-soft',
                    !current && !doneStep && 'border-subtle text-content-muted',
                  )}
                  aria-current={current ? 'step' : undefined}
                >
                  {doneStep ? <FiCheck aria-hidden="true" className="h-3.5 w-3.5" /> : null}
                  {step.label}
                </button>
              </li>
            )
          })}
        </ol>
        {microSuccess ? (
          <p className="mt-3 text-meta font-medium text-status-success" role="status">
            {microSuccess}
          </p>
        ) : null}
      </div>

      <form className="mt-8" onSubmit={continueOrSubmit} noValidate aria-describedby={stepStatusId}>
        {showSummary ? (
          <div
            ref={errorSummaryRef}
            id={summaryId}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className={cn(
              'mb-6 rounded-dos-xl border border-status-danger/25 bg-status-danger-surface px-4 py-4 text-status-danger outline-none focus-visible:ring-2 focus-visible:ring-dos',
              !reducedMotion && 'transition-opacity duration-fast ease-dos',
            )}
          >
            <p className="text-meta font-semibold">
              Fix {errorList.length} item{errorList.length === 1 ? '' : 's'} before continuing
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
              {errorList.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                    onClick={() => focusField(item.id)}
                  >
                    {FIELD_LABELS[item.id] || item.id}
                  </button>
                  <span className="text-status-danger/90"> — {item.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {currentStep.id === 'intent' ? (
          <div>
            <fieldset className="min-w-0">
              <legend id={intentLegendId} className="text-meta font-semibold text-emerald-deep">
                What is this about?
              </legend>
              <div
                className="mt-3 space-y-2"
                role="radiogroup"
                aria-labelledby={intentLegendId}
                aria-describedby={errors.intentId ? `${formId}-intent-error` : undefined}
                aria-invalid={errors.intentId ? true : undefined}
              >
                {contactIntents.map((intent) => {
                  const checked = form.intentId === intent.id
                  return (
                    <label
                      key={intent.id}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center gap-3 rounded-dos-xl border px-3 py-2.5 text-body',
                        !reducedMotion && 'transition duration-fast ease-dos',
                        checked
                          ? 'border-action-primary/40 bg-action-primary-hover/5 text-emerald-deep'
                          : 'border-subtle bg-surface-base text-ink-soft hover:border-action-primary/25',
                        errors.intentId && stepAttempted && 'border-status-danger/40',
                      )}
                    >
                      <input
                        type="radio"
                        name={`${formId}-intent`}
                        value={intent.id}
                        checked={checked}
                        onChange={() => {
                          setField('intentId', intent.id)
                          setTouched((t) => ({ ...t, intentId: true }))
                        }}
                        onBlur={() => handleBlur('intentId')}
                        className="h-4 w-4 accent-emerald-deep"
                      />
                      <span>{intent.label}</span>
                    </label>
                  )
                })}
              </div>
              {showError('intentId') ? (
                <p id={`${formId}-intent-error`} className="mt-2 text-sm text-status-danger">
                  {errors.intentId}
                </p>
              ) : null}
            </fieldset>

            {selectedIntent?.deflect ? (
              <p className="mt-4 rounded-dos-xl border border-subtle bg-surface-sunken px-4 py-3 text-sm text-ink-soft">
                {selectedIntent.deflect.text}{' '}
                <a
                  href={selectedIntent.deflect.href}
                  className="font-semibold text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  {selectedIntent.deflect.linkLabel}
                </a>
              </p>
            ) : null}

            {selectedIntent?.extraField ? (
              <div className="mt-6">
                <label htmlFor={`${formId}-order-ref`} className="block text-meta font-semibold text-emerald-deep">
                  {selectedIntent.extraField.label}
                </label>
                <p id={`${formId}-order-hint`} className="mt-1 text-sm text-content-muted">
                  {selectedIntent.extraField.hint}
                </p>
                <input
                  id={`${formId}-order-ref`}
                  ref={(node) => {
                    fieldRefs.current.orderRef = node
                  }}
                  type="text"
                  value={form.orderRef}
                  onChange={(e) => setField('orderRef', e.target.value)}
                  onBlur={() => handleBlur('orderRef')}
                  aria-invalid={errors.orderRef ? true : undefined}
                  aria-describedby={[`${formId}-order-hint`, errors.orderRef ? `${formId}-order-error` : null]
                    .filter(Boolean)
                    .join(' ')}
                  placeholder={selectedIntent.extraField.placeholder}
                  className={inputClass('orderRef')}
                />
                {showError('orderRef') ? (
                  <p id={`${formId}-order-error`} className="mt-2 text-sm text-status-danger">
                    {errors.orderRef}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep.id === 'you' ? (
          <div className="space-y-6">
            <div>
              <label htmlFor={`${formId}-name`} className="block text-meta font-semibold text-emerald-deep">
                Your name
              </label>
              <p id={`${formId}-name-hint`} className="mt-1 text-sm text-content-muted">
                How should we address you?
              </p>
              <input
                id={`${formId}-name`}
                ref={(node) => {
                  fieldRefs.current.name = node
                }}
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={[`${formId}-name-hint`, errors.name ? `${formId}-name-error` : null]
                  .filter(Boolean)
                  .join(' ')}
                className={inputClass('name')}
              />
              {showError('name') ? (
                <p id={`${formId}-name-error`} className="mt-2 text-sm text-status-danger">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <PhoneInput
                dialCode={form.dialCode}
                onDialCodeChange={(dialCode) => setField('dialCode', dialCode)}
                phone={form.phone}
                onPhoneChange={(phone) => setField('phone', phone)}
                onBlur={() => handleBlur('phone')}
                phoneId={`${formId}-phone`}
                dialId={`${formId}-dial`}
                describedBy={errors.phone ? `${formId}-phone-error` : undefined}
                invalid={showError('phone')}
                inputRef={(node) => {
                  fieldRefs.current.phone = node
                }}
              />
              {showError('phone') ? (
                <p id={`${formId}-phone-error`} className="mt-2 text-sm text-status-danger">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-email`} className="block text-meta font-semibold text-emerald-deep">
                Email address
              </label>
              <p id={`${formId}-email-hint`} className="mt-1 text-sm text-content-muted">
                We reply to this address within one working day.
              </p>
              <input
                id={`${formId}-email`}
                ref={(node) => {
                  fieldRefs.current.email = node
                }}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={[`${formId}-email-hint`, errors.email ? `${formId}-email-error` : null]
                  .filter(Boolean)
                  .join(' ')}
                className={inputClass('email')}
              />
              {showError('email') ? (
                <p id={`${formId}-email-error`} className="mt-2 text-sm text-status-danger">
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentStep.id === 'brief' ? (
          <div>
            <label htmlFor={`${formId}-message`} className="block text-meta font-semibold text-emerald-deep">
              Message
            </label>
            <p id={`${formId}-message-hint`} className="mt-1 text-sm text-content-muted">
              Goals, timeline, and anything we should know before quoting.
            </p>
            <textarea
              id={`${formId}-message`}
              ref={(node) => {
                fieldRefs.current.message = node
              }}
              rows={5}
              value={form.message}
              onChange={(e) => setField('message', e.target.value)}
              onBlur={() => handleBlur('message')}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={[`${formId}-message-hint`, errors.message ? `${formId}-message-error` : null]
                .filter(Boolean)
                .join(' ')}
              className={cn(inputClass('message'), 'min-h-[8rem] resize-y')}
            />
            {showError('message') ? (
              <p id={`${formId}-message-error`} className="mt-2 text-sm text-status-danger">
                {errors.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {currentStep.id === 'review' ? (
          <div className="space-y-4">
            <dl className="divide-y divide-subtle rounded-dos-xl border border-subtle">
              {[
                { step: 0, label: 'About', value: selectedIntent?.label || '—' },
                selectedIntent?.extraField
                  ? { step: 0, label: selectedIntent.extraField.label, value: form.orderRef || '—' }
                  : null,
                { step: 1, label: 'Name', value: form.name },
                { step: 1, label: 'Phone', value: `${form.dialCode}${form.phone}` },
                { step: 1, label: 'Email', value: form.email },
                { step: 2, label: 'Message', value: form.message },
              ]
                .filter(Boolean)
                .map((row) => (
                  <div key={row.label} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <dt className="text-meta font-semibold text-content-muted">{row.label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-body text-ink">{row.value}</dd>
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
            <p className="text-sm text-content-muted">
              Sending creates a reference code. We reply from {siteConfig.email} within one working day.
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={stepIndex === 0 || loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-subtle px-5 text-meta font-semibold text-ink-soft transition duration-fast ease-dos hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiArrowLeft aria-hidden="true" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-action-primary-hover px-6 text-meta font-semibold text-cream transition duration-fast ease-dos hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? 'Sending…' : currentStep.id === 'review' ? 'Send message' : 'Continue'}
            {!loading && currentStep.id !== 'review' ? <FiArrowRight aria-hidden="true" /> : null}
          </button>
        </div>
      </form>
    </div>
  )
}
