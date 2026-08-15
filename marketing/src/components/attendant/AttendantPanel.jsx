import { useEffect, useRef } from 'react'
import { bindFocusTrap } from '../../lib/utils'
import { useAttendant } from './AttendantProvider'
import AttendantHeader from './AttendantHeader'
import AttendantComposer from './AttendantComposer'
import {
  AttendantConfirm,
  AttendantEmpty,
  AttendantError,
  AttendantMessage,
  AttendantStatus,
} from './AttendantParts'

export default function AttendantPanel() {
  const {
    open,
    closePanel,
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
    resetSession,
    sendMessage,
  } = useAttendant()

  const panelRef = useRef(null)
  const transcriptRef = useRef(null)
  const lastVisitorFailed = [...messages].reverse().find((m) => m.role === 'visitor' && m.status === 'failed')

  useEffect(() => {
    if (!open || !panelRef.current) return undefined
    return bindFocusTrap(panelRef.current, { onEscape: closePanel })
  }, [open, closePanel])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    if (window.matchMedia('(max-width: 767px)').matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const el = transcriptRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, pendingConfirm, error, streaming])

  if (!open) return null

  const showEmpty = messages.length === 0 && sessionStatus !== 'loading' && !error

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-surface-overlay md:hidden"
        aria-label="Dismiss attendant"
        onClick={closePanel}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendant-dialog-title"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border border-subtle bg-surface-raised shadow-xl md:inset-auto md:bottom-6 md:right-5 md:h-[min(640px,calc(100vh-3rem))] md:w-[380px] md:rounded-2xl"
      >
        <AttendantHeader onClose={closePanel} />

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
