import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import PhoneInput from './PhoneInput'
import { defaultDialCode } from './CountrySelect'
import SubmissionConfirmation from '../site/SubmissionConfirmation'
import { apiEndpoints, siteConfig } from '../../site.config'
import { contactIntents, intentFromSearchParam } from '../../config/contactIntents'
import { useFormSubmit } from '../../lib/useFormSubmit'
import { cn } from '../../lib/utils'

const DRAFT_KEY = 'sleeklybuilt-contact-draft'
const SUCCESS_KEY_PREFIX = 'sleeklybuilt-contact-ok:'

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

function writeDraft(form) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, savedAt: Date.now() }))
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
      return form.orderRef.trim()
        ? null
        : `Add your ${selectedIntent.extraField.label.toLowerCase()}.`
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

const FIELD_ORDER = ['intentId', 'orderRef', 'name', 'phone', 'email', 'message']

const FIELD_LABELS = {
  intentId: 'What this is about',
  orderRef: 'Order reference',
  name: 'Your name',
  phone: 'Phone number',
  email: 'Email address',
  message: 'Message',
}

/**
 * Contact enquiry form — forms_system + multi_step_form a11y contract.
 * Flattened to one screen (≤6 fields): persistent labels, blur validation,
 * linked assertive error summary, draft persistence, 44px targets.
 */
export default function GamifiedContactForm() {
  const reducedMotion = useReducedMotion()
  const [searchParams] = useSearchParams()
  const formId = useId()
  const intentLegendId = `${formId}-intent-legend`
  const summaryId = `${formId}-error-summary`
  const errorSummaryRef = useRef(null)
  const fieldRefs = useRef({})

  const [submissionKey] = useState(() => makeSubmissionKey())
  const [form, setForm] = useState(empty)
  const [done, setDone] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [hydrated, setHydrated] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

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
    } else if (fromUrl) {
      setForm((f) => ({ ...f, intentId: fromUrl }))
    }
    setHydrated(true)
  }, [searchParams, submissionKey])

  useEffect(() => {
    if (!hydrated || done) return
    writeDraft(form)
  }, [form, hydrated, done])

  const selectedIntent = useMemo(
    () => contactIntents.find((item) => item.id === form.intentId) ?? null,
    [form.intentId],
  )

  const activeFieldIds = useMemo(() => {
    return FIELD_ORDER.filter((id) => id !== 'orderRef' || Boolean(selectedIntent?.extraField))
  }, [selectedIntent])

  const validateAll = () => {
    const next = {}
    activeFieldIds.forEach((id) => {
      const message = fieldErrorMessage(id, form, selectedIntent)
      if (message) next[id] = message
    })
    return next
  }

  const errorList = useMemo(
    () => activeFieldIds.filter((id) => errors[id]).map((id) => ({ id, message: errors[id] })),
    [activeFieldIds, errors],
  )

  const showSummary = submitAttempted && errorList.length > 0

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
      const first = document.querySelector(`input[name="${formId}-intent"]`)
      first?.focus()
      return
    }
    const node = fieldRefs.current[id]
    node?.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitAttempted(true)
    const nextErrors = validateAll()
    setErrors(nextErrors)
    setTouched((t) => {
      const all = { ...t }
      activeFieldIds.forEach((id) => {
        all[id] = true
      })
      return all
    })

    if (Object.keys(nextErrors).length > 0) {
      queueMicrotask(() => {
        errorSummaryRef.current?.focus()
      })
      return
    }

    const intent = selectedIntent
    let message = form.message.trim()
    if (intent?.extraField && form.orderRef.trim()) {
      message = `Order reference: ${form.orderRef.trim()}\n\n${message}`
    }

    try {
      await submit({
        name: form.name.trim(),
        phone: `${form.dialCode}${form.phone.trim()}`,
        email: form.email.trim(),
        subject: intent?.subject || 'General enquiry',
        message,
        intent: intent?.id || 'other',
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
    setSubmitAttempted(false)
  }

  const inputClass = (id) =>
    cn(
      'mt-2 w-full min-h-11 rounded-xl border bg-surface-base px-3 py-2.5 text-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
      errors[id] && (touched[id] || submitAttempted)
        ? 'border-status-danger/40'
        : 'border-cream-deep focus:border-emerald/40',
    )

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

  return (
    <div className="rounded-2xl border border-cream-deep bg-surface-raised p-6 shadow-sm sm:p-8">
      <div>
        <p className="eyebrow">Project enquiry</p>
        <h2 className="mt-2 display-card text-emerald-deep">Tell us what you need</h2>
        <p className="mt-2 text-body text-ink-soft">
          About two minutes. Your draft is saved on this device until you send.
        </p>
      </div>

      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        {showSummary ? (
          <div
            ref={errorSummaryRef}
            id={summaryId}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className={cn(
              'mb-6 rounded-xl border border-status-danger/25 bg-status-danger-surface px-4 py-4 text-status-danger outline-none focus-visible:ring-2 focus-visible:ring-dos',
              !reducedMotion && 'transition-opacity duration-fast ease-dos',
            )}
          >
            <p className="text-meta font-semibold">
              Fix {errorList.length} item{errorList.length === 1 ? '' : 's'} before sending
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
                    'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-body',
                    !reducedMotion && 'transition duration-fast ease-dos',
                    checked
                      ? 'border-emerald/40 bg-emerald-deep/5 text-emerald-deep'
                      : 'border-cream-deep bg-surface-base text-ink-soft hover:border-emerald/25',
                    errors.intentId && submitAttempted && 'border-status-danger/40',
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
          {errors.intentId && (touched.intentId || submitAttempted) ? (
            <p id={`${formId}-intent-error`} className="mt-2 text-sm text-status-danger">
              {errors.intentId}
            </p>
          ) : null}
        </fieldset>

        {selectedIntent?.deflect ? (
          <p className="mt-4 rounded-xl border border-cream-deep bg-surface-sunken px-4 py-3 text-sm text-ink-soft">
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
              aria-describedby={[
                `${formId}-order-hint`,
                errors.orderRef ? `${formId}-order-error` : null,
              ]
                .filter(Boolean)
                .join(' ')}
              placeholder={selectedIntent.extraField.placeholder}
              className={inputClass('orderRef')}
            />
            {errors.orderRef && (touched.orderRef || submitAttempted) ? (
              <p id={`${formId}-order-error`} className="mt-2 text-sm text-status-danger">
                {errors.orderRef}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6">
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
            aria-describedby={[
              `${formId}-name-hint`,
              errors.name ? `${formId}-name-error` : null,
            ]
              .filter(Boolean)
              .join(' ')}
            className={inputClass('name')}
          />
          {errors.name && (touched.name || submitAttempted) ? (
            <p id={`${formId}-name-error`} className="mt-2 text-sm text-status-danger">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <PhoneInput
            dialCode={form.dialCode}
            onDialCodeChange={(dialCode) => setField('dialCode', dialCode)}
            phone={form.phone}
            onPhoneChange={(phone) => setField('phone', phone)}
            onBlur={() => handleBlur('phone')}
            phoneId={`${formId}-phone`}
            dialId={`${formId}-dial`}
            describedBy={errors.phone ? `${formId}-phone-error` : undefined}
            invalid={Boolean(errors.phone && (touched.phone || submitAttempted))}
            inputRef={(node) => {
              fieldRefs.current.phone = node
            }}
          />
          {errors.phone && (touched.phone || submitAttempted) ? (
            <p id={`${formId}-phone-error`} className="mt-2 text-sm text-status-danger">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
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
            aria-describedby={[
              `${formId}-email-hint`,
              errors.email ? `${formId}-email-error` : null,
            ]
              .filter(Boolean)
              .join(' ')}
            className={inputClass('email')}
          />
          {errors.email && (touched.email || submitAttempted) ? (
            <p id={`${formId}-email-error`} className="mt-2 text-sm text-status-danger">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
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
            aria-describedby={[
              `${formId}-message-hint`,
              errors.message ? `${formId}-message-error` : null,
            ]
              .filter(Boolean)
              .join(' ')}
            className={cn(inputClass('message'), 'min-h-[8rem] resize-y')}
          />
          {errors.message && (touched.message || submitAttempted) ? (
            <p id={`${formId}-message-error`} className="mt-2 text-sm text-status-danger">
              {errors.message}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-sm text-content-muted">
          Sending creates a reference code. We reply from {siteConfig.email}.
        </p>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-action-primary-hover px-6 py-3 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </form>
    </div>
  )
}
