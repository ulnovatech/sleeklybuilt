import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
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

/**
 * One visible prompt at a time — conversational, not interrogation.
 * Auto-advances on valid intent tap / Enter; Send only on the last step.
 */
const PROMPTS = [
  {
    id: 'intent',
    field: 'intentId',
    question: 'What brings you here?',
    hint: 'Pick the closest match — we route from this.',
  },
  {
    id: 'orderRef',
    field: 'orderRef',
    question: 'Got an order or payment reference?',
    hint: 'Helps us find your order immediately.',
    when: (form) => form.intentId === 'order',
  },
  {
    id: 'name',
    field: 'name',
    question: 'What should we call you?',
    hint: 'First name is fine.',
    input: 'text',
    autoComplete: 'name',
  },
  {
    id: 'phone',
    field: 'phone',
    question: 'What’s the best number to reach you?',
    hint: 'We’ll only use this about your enquiry.',
  },
  {
    id: 'email',
    field: 'email',
    question: 'Where should we reply?',
    hint: 'We respond within one working day.',
    input: 'email',
    autoComplete: 'email',
    inputMode: 'email',
  },
  {
    id: 'message',
    field: 'message',
    question: 'What do you need?',
    hint: 'A few sentences on goals or blockers is enough.',
    input: 'textarea',
  },
  {
    id: 'send',
    field: null,
    question: 'Ready to send?',
    hint: 'We’ll confirm with a reference you can quote later.',
  },
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

function writeDraft(form, promptIndex) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, promptIndex, savedAt: Date.now() }))
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

function fieldError(field, form, selectedIntent) {
  switch (field) {
    case 'intentId':
      return form.intentId ? null : 'Choose an option to continue.'
    case 'orderRef':
      if (!selectedIntent?.extraField) return null
      return form.orderRef.trim() ? null : 'Add your order or payment reference.'
    case 'name':
      return form.name.trim() ? null : 'Enter your name.'
    case 'phone':
      return form.phone.trim() ? null : 'Enter your phone number.'
    case 'email':
      if (!form.email.trim()) return 'Enter your email.'
      if (!EMAIL_RE.test(form.email.trim())) return 'Enter a valid email.'
      return null
    case 'message':
      return form.message.trim() ? null : 'Add a short note about what you need.'
    default:
      return null
  }
}

function activePrompts(form) {
  return PROMPTS.filter((p) => !p.when || p.when(form))
}

/**
 * Conversational contact enquiry (contact + multi_step_form patterns).
 * One prompt visible; chip/Enter advances; Send only at the end.
 */
export default function GamifiedContactForm() {
  const siteConfig = useSiteConfig()
  const reducedMotion = useReducedMotion()
  const [searchParams] = useSearchParams()
  const formId = useId()
  const statusId = `${formId}-status`
  const headingRef = useRef(null)
  const inputRef = useRef(null)

  const [submissionKey] = useState(() => makeSubmissionKey())
  const [form, setForm] = useState(empty)
  const [promptIndex, setPromptIndex] = useState(0)
  const [done, setDone] = useState(null)
  const [error, setError] = useState(null)
  const [hydrated, setHydrated] = useState(false)
  const [attempted, setAttempted] = useState(false)

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

  const selectedIntent = useMemo(
    () => contactIntents.find((item) => item.id === form.intentId) ?? null,
    [form.intentId],
  )

  const prompts = useMemo(() => activePrompts(form), [form])
  const safeIndex = Math.min(promptIndex, prompts.length - 1)
  const current = prompts[safeIndex]
  const isLast = current?.id === 'send'

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
      setForm({ ...empty, ...draft.form, intentId: fromUrl || draft.form.intentId || '' })
      if (typeof draft.promptIndex === 'number') setPromptIndex(Math.max(0, draft.promptIndex))
      else if (typeof draft.stepIndex === 'number') setPromptIndex(Math.max(0, draft.stepIndex))
    } else if (fromUrl) {
      setForm((f) => ({ ...f, intentId: fromUrl }))
      setPromptIndex(1)
    }
    setHydrated(true)
  }, [searchParams, submissionKey])

  useEffect(() => {
    if (!hydrated || done) return
    writeDraft(form, safeIndex)
  }, [form, safeIndex, hydrated, done])

  useEffect(() => {
    if (!hydrated || done) return
    queueMicrotask(() => {
      headingRef.current?.focus()
      inputRef.current?.focus?.()
    })
  }, [safeIndex, hydrated, done, current?.id])

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  const advance = () => {
    setAttempted(false)
    setError(null)
    setPromptIndex((i) => Math.min(i + 1, activePrompts(form).length - 1))
  }

  const goBack = () => {
    setAttempted(false)
    setError(null)
    setPromptIndex((i) => Math.max(0, i - 1))
  }

  const goToPrompt = (index) => {
    if (index < 0 || index >= safeIndex) return
    setAttempted(false)
    setError(null)
    setPromptIndex(index)
  }

  const validateCurrent = () => {
    if (!current?.field) return null
    return fieldError(current.field, form, selectedIntent)
  }

  const tryAdvance = () => {
    const message = validateCurrent()
    if (message) {
      setAttempted(true)
      setError(message)
      return false
    }
    advance()
    return true
  }

  const handleIntentSelect = (intentId) => {
    setForm((f) => ({ ...f, intentId, orderRef: intentId === 'order' ? f.orderRef : '' }))
    setError(null)
    setAttempted(false)
    // Advance after state settles to the correct prompt list
    queueMicrotask(() => {
      setPromptIndex(1)
    })
  }

  const onKeyDownAdvance = (event) => {
    if (event.key !== 'Enter') return
    if (current?.input === 'textarea' && !event.metaKey && !event.ctrlKey) return
    event.preventDefault()
    tryAdvance()
  }

  const send = async () => {
    const required = ['intentId', 'name', 'phone', 'email', 'message']
    if (selectedIntent?.extraField) required.splice(1, 0, 'orderRef')
    for (const field of required) {
      const message = fieldError(field, form, selectedIntent)
      if (message) {
        const idx = prompts.findIndex((p) => p.field === field)
        if (idx >= 0) setPromptIndex(idx)
        setAttempted(true)
        setError(message)
        return
      }
    }

    let messageBody = form.message.trim()
    if (selectedIntent?.extraField && form.orderRef.trim()) {
      messageBody = `Order reference: ${form.orderRef.trim()}\n\n${messageBody}`
    }

    try {
      await submit({
        name: form.name.trim(),
        phone: `${form.dialCode}${form.phone.trim()}`,
        email: form.email.trim(),
        subject: selectedIntent?.subject || 'General enquiry',
        message: messageBody,
        intent: selectedIntent?.id || 'other',
        submission_key: submissionKey,
      })
    } catch {
      /* toast + draft kept */
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
    setError(null)
    setAttempted(false)
    setPromptIndex(0)
  }

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
    <div className="rounded-xl border border-subtle bg-surface-raised p-5 shadow-sm sm:p-6">
      <div
        className="flex items-center justify-between gap-3"
        aria-live="polite"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={prompts.length}
        aria-valuenow={safeIndex + 1}
        aria-labelledby={statusId}
      >
        <p id={statusId} className="shrink-0 text-meta text-content-muted">
          <span className="font-semibold tabular-nums text-emerald-deep">
            {safeIndex + 1}/{prompts.length}
          </span>
        </p>
        <ol className="flex min-w-0 flex-1 items-center justify-end" aria-label="Progress">
          {prompts.map((p, index) => (
            <li key={p.id}>
              <button
                type="button"
                disabled={index > safeIndex}
                onClick={() => goToPrompt(index)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:cursor-default"
                aria-label={`${p.question}${index < safeIndex ? ' (done)' : index === safeIndex ? ' (current)' : ''}`}
                aria-current={index === safeIndex ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'block rounded-full',
                    index === safeIndex ? 'h-2.5 w-2.5 bg-action-primary' : 'h-2 w-2',
                    index < safeIndex && 'bg-action-primary-hover',
                    index > safeIndex && 'bg-surface-sunken',
                  )}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="field-label outline-none focus-visible:ring-2 focus-visible:ring-dos"
        >
          {current.question}
        </h2>
        {current.hint ? <p className="field-hint">{current.hint}</p> : null}
      </div>

      <div className="mt-5">
        {current.id === 'intent' ? (
          <div
            role="radiogroup"
            aria-labelledby={statusId}
            className="grid gap-2"
          >
            {contactIntents.map((intent) => {
              const checked = form.intentId === intent.id
              return (
                <button
                  key={intent.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => handleIntentSelect(intent.id)}
                  className={cn(
                    'flex min-h-11 items-center rounded-lg border px-3.5 py-2.5 text-left text-body transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
                    checked
                      ? 'border-action-primary/40 bg-action-primary-hover/5 text-emerald-deep'
                      : 'border-subtle bg-surface-base text-ink hover:border-action-primary/25',
                  )}
                >
                  <span className="flex-1">{intent.label}</span>
                  {checked ? <FiCheck className="h-4 w-4 shrink-0 text-emerald" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        ) : null}

        {current.id === 'orderRef' ? (
          <input
            ref={inputRef}
            id={`${formId}-order`}
            type="text"
            value={form.orderRef}
            onChange={(e) => setField('orderRef', e.target.value)}
            onKeyDown={onKeyDownAdvance}
            aria-invalid={attempted && error ? true : undefined}
            aria-describedby={error ? `${formId}-err` : undefined}
            placeholder="FLW-… or invoice number"
            className={cn('field-input', attempted && error && 'field-input-error')}
            autoComplete="off"
          />
        ) : null}

        {current.id === 'name' || current.id === 'email' ? (
          <input
            ref={inputRef}
            id={`${formId}-${current.field}`}
            type={current.input}
            inputMode={current.inputMode}
            autoComplete={current.autoComplete}
            value={form[current.field]}
            onChange={(e) => setField(current.field, e.target.value)}
            onKeyDown={onKeyDownAdvance}
            aria-invalid={attempted && error ? true : undefined}
            aria-describedby={error ? `${formId}-err` : undefined}
            className={cn('field-input', attempted && error && 'field-input-error')}
          />
        ) : null}

        {current.id === 'phone' ? (
          <PhoneInput
            compact
            dialCode={form.dialCode}
            onDialCodeChange={(dialCode) => setField('dialCode', dialCode)}
            phone={form.phone}
            onPhoneChange={(phone) => setField('phone', phone)}
            onKeyDown={onKeyDownAdvance}
            phoneId={`${formId}-phone`}
            dialId={`${formId}-dial`}
            describedBy={error ? `${formId}-err` : undefined}
            invalid={Boolean(attempted && error)}
            inputRef={inputRef}
          />
        ) : null}

        {current.id === 'message' ? (
          <textarea
            ref={inputRef}
            id={`${formId}-message`}
            rows={4}
            value={form.message}
            onChange={(e) => setField('message', e.target.value)}
            onKeyDown={onKeyDownAdvance}
            aria-invalid={attempted && error ? true : undefined}
            aria-describedby={error ? `${formId}-err` : undefined}
            className={cn('field-input min-h-[6.5rem] resize-y', attempted && error && 'field-input-error')}
            placeholder="Ctrl/⌘ + Enter to continue"
          />
        ) : null}

        {isLast ? (
          <dl className="space-y-2 rounded-lg border border-subtle bg-surface-sunken/60 px-3.5 py-3 text-meta">
            {[
              ['About', selectedIntent?.label],
              selectedIntent?.extraField ? [selectedIntent.extraField.label, form.orderRef] : null,
              ['Name', form.name],
              ['Phone', `${form.dialCode}${form.phone}`],
              ['Email', form.email],
              ['Message', form.message],
            ]
              .filter(Boolean)
              .map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-16 shrink-0 text-content-muted">{label}</dt>
                  <dd className="min-w-0 flex-1 whitespace-pre-wrap text-ink">{value || '—'}</dd>
                </div>
              ))}
          </dl>
        ) : null}

        {error ? (
          <p id={`${formId}-err`} className="field-error" role="alert">
            {error}
          </p>
        ) : null}

        {current.id === 'intent' && selectedIntent?.deflect ? (
          <p className="mt-3 text-sm text-ink-soft">
            {selectedIntent.deflect.text}{' '}
            <a
              href={selectedIntent.deflect.href}
              className="font-semibold text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              {selectedIntent.deflect.linkLabel}
            </a>
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={safeIndex === 0 || loading}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-ink-soft transition hover:text-emerald-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-30"
        >
          <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={send}
            disabled={loading}
            className="inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-full bg-action-primary-hover px-5 text-sm font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        ) : current.id === 'intent' ? (
          <span className="text-meta text-content-muted">Tap an option</span>
        ) : (
          <button
            type="button"
            onClick={tryAdvance}
            className="inline-flex h-10 items-center rounded-full px-3 text-sm font-semibold text-emerald-deep transition hover:bg-action-primary-hover/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
          >
            Next
            <span className="ml-2 hidden text-content-muted font-normal sm:inline">
              {current.input === 'textarea' ? '⌘/Ctrl+Enter' : 'or Enter'}
            </span>
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-content-muted">
        Reply from {siteConfig.email} · draft saved on this device
      </p>
    </div>
  )
}
