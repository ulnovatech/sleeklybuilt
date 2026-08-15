import { useEffect, useId, useRef, useState } from 'react'
import { useAttendant } from './AttendantProvider'

export default function AttendantComposer() {
  const { sendMessage, streaming, pendingConfirm, sessionStatus } = useAttendant()
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  const labelId = useId()
  const disabled = streaming || Boolean(pendingConfirm) || sessionStatus === 'loading'

  useEffect(() => {
    if (!disabled && window.matchMedia('(min-width: 768px)').matches) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    const text = value
    setValue('')
    sendMessage(text)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-subtle bg-surface-raised px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <label id={labelId} htmlFor="attendant-composer" className="sr-only">
        Message to SleeklyBuilt attendant
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="attendant-composer"
          ref={inputRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit(e)
            }
          }}
          placeholder={pendingConfirm ? 'Confirm or cancel above' : 'Ask about products, prices, or next steps'}
          className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-subtle bg-surface-base px-3 py-2.5 text-sm text-content-primary placeholder:text-content-muted focus:border-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-60"
          aria-labelledby={labelId}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-action-primary text-cream transition hover:bg-action-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:opacity-40"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}
