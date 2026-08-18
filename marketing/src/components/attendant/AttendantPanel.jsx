import { useEffect, useRef } from 'react'
import { bindFocusTrap } from '../../lib/utils'
import { useAttendant } from './AttendantProvider'
import AttendantHeader from './AttendantHeader'
import AttendantComposer from './AttendantComposer'
import {
  AttendantChoices,
  AttendantConfirm,
  AttendantEmpty,
  AttendantError,
  AttendantMessage,
  AttendantStatus,
} from './AttendantParts'

export default function AttendantPanel() {
  const {
    open,
    minimized,
    minimizePanel,
    pageContext,
    sessionStatus,
    messages,
    streaming,
    error,
    clearError,
    pendingConfirm,
    submitConfirm,
    cancelConfirm,
    confirmBusy,
    pendingChoices,
    submitChoice,
    cancelChoices,
    choiceBusy,
    resetSession,
    sendMessage,
    escalationState,
  } = useAttendant()

  const panelRef = useRef(null)
  const transcriptRef = useRef(null)
  const lastVisitorFailed = [...messages].reverse().find((m) => m.role === 'visitor' && m.status === 'failed')
  const connecting =
    escalationState === 'escalated' || escalationState === 'human_active'
  const expanded = open && !minimized

  useEffect(() => {
    if (!expanded || !panelRef.current) return undefined
    const desktop = window.matchMedia('(min-width: 1024px)')
    if (desktop.matches) {
      const onKey = (event) => {
        if (event.key === 'Escape') minimizePanel()
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
    return bindFocusTrap(panelRef.current, { onEscape: minimizePanel })
  }, [expanded, minimizePanel])

  useEffect(() => {
    if (!expanded) return undefined
    const prev = document.body.style.overflow
    if (window.matchMedia('(max-width: 1023px)').matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [expanded])

  useEffect(() => {
    const el = transcriptRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, pendingConfirm, pendingChoices, error, streaming])

  if (!expanded) return null

  const showEmpty = messages.length === 0 && sessionStatus !== 'loading' && !error

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-surface-overlay lg:hidden"
        aria-label="Minimize attendant"
        onClick={minimizePanel}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendant-dialog-title"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border border-subtle bg-surface-raised shadow-xl lg:inset-auto lg:bottom-0 lg:right-0 lg:top-0 lg:h-auto lg:max-h-none lg:w-[380px] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:shadow-none"
      >
        <AttendantHeader onMinimize={minimizePanel} />

        {connecting ? (
          <div className="border-b border-subtle bg-surface-sunken px-4 py-2.5" role="status">
            <p className="text-xs leading-relaxed text-content-muted">
              {escalationState === 'human_active'
                ? 'You are chatting with the SleeklyBuilt team. WhatsApp remains available anytime.'
                : 'Connecting you with the team… Keep messaging here; WhatsApp remains available anytime.'}
            </p>
          </div>
        ) : null}

        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto overscroll-contain py-2"
          aria-live="polite"
          aria-relevant="additions"
        >
          <AttendantStatus sessionStatus={sessionStatus} />
          {showEmpty ? <AttendantEmpty pageId={pageContext.page_id} /> : null}
          {messages.map((m) => (
            <AttendantMessage key={m.id} message={m} />
          ))}
        </div>

        {error ? (
          <AttendantError
            error={error}
            onRetry={() => {
              clearError()
              if (lastVisitorFailed?.text) {
                sendMessage(lastVisitorFailed.text)
              }
            }}
            onReset={() => {
              clearError()
              resetSession()
            }}
          />
        ) : null}

        <AttendantChoices
          pending={pendingChoices}
          busy={choiceBusy || streaming}
          onSelect={submitChoice}
          onCancel={cancelChoices}
        />

        <AttendantConfirm
          pending={pendingConfirm}
          busy={confirmBusy}
          onConfirm={submitConfirm}
          onCancel={cancelConfirm}
        />

        <AttendantComposer />
      </div>
    </>
  )
}
