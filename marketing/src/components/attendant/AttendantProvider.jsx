import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { confirmAction, createSession, pollMessages, selectChoice, streamChat } from './api'
import { applyClientAction } from './clientActions'
import { buildPageContext, pageIdFromPath } from './pageContext'

const STORAGE_TOKEN = 'sb_attendant_session'
const STORAGE_CONV = 'sb_attendant_conversation'
const STORAGE_RECENT = 'sb_attendant_recent_pages'

const AttendantContext = createContext(null)

function readRecent() {
  try {
    const raw = sessionStorage.getItem(STORAGE_RECENT)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function pushRecent(pageId) {
  if (!pageId || pageId === 'unknown') return readRecent()
  const prev = readRecent().filter((id) => id !== pageId)
  const next = [pageId, ...prev].slice(0, 8)
  sessionStorage.setItem(STORAGE_RECENT, JSON.stringify(next))
  return next
}

export function AttendantProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem(STORAGE_TOKEN) || '')
  const [conversationId, setConversationId] = useState(
    () => sessionStorage.getItem(STORAGE_CONV) || '',
  )
  const [sessionStatus, setSessionStatus] = useState('idle') // idle | loading | ready | error
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [confirmResult, setConfirmResult] = useState(null)
  const [pendingChoices, setPendingChoices] = useState(null)
  const [choiceBusy, setChoiceBusy] = useState(false)
  const [escalationState, setEscalationState] = useState('autonomous')
  const abortRef = useRef(null)
  const streamBufRef = useRef('')
  const lastMsgIdRef = useRef(0)

  const recent = useMemo(() => readRecent(), [location.pathname])
  const pageContext = useMemo(
    () =>
      buildPageContext(
        {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          href: typeof window !== 'undefined' ? window.location.href : location.pathname,
        },
        recent,
      ),
    [location.pathname, location.search, location.hash, recent],
  )

  useEffect(() => {
    pushRecent(pageIdFromPath(location.pathname))
  }, [location.pathname])

  // Poll for human/system messages while escalated or human_active.
  useEffect(() => {
    const humanControlled =
      escalationState === 'escalated' || escalationState === 'human_active'
    if (!open || !humanControlled || !sessionToken) return undefined

    let cancelled = false
    const tick = async () => {
      try {
        const data = await pollMessages({
          sessionToken,
          afterId: lastMsgIdRef.current,
        })
        if (cancelled) return
        if (data.escalation_state) {
          setEscalationState(data.escalation_state)
        }
        const incoming = Array.isArray(data.messages) ? data.messages : []
        if (incoming.length === 0) return
        setMessages((prev) => {
          const known = new Set(prev.map((m) => String(m.serverId || m.id)))
          const next = [...prev]
          for (const m of incoming) {
            lastMsgIdRef.current = Math.max(lastMsgIdRef.current, Number(m.id) || 0)
            const key = String(m.id)
            if (known.has(key)) continue
            if (m.role === 'visitor') continue
            next.push({
              id: `srv-${m.id}`,
              serverId: m.id,
              role: m.role === 'human' ? 'human' : m.role === 'system' ? 'system' : 'attendant',
              text: m.text,
              status: 'sent',
            })
            known.add(key)
          }
          return next
        })
      } catch {
        /* ignore transient poll errors */
      }
    }

    tick()
    const timer = window.setInterval(tick, 3000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [open, escalationState, sessionToken])

  const ensureSession = useCallback(async (force = false) => {
    const existing =
      !force && (sessionToken || sessionStorage.getItem(STORAGE_TOKEN) || '')
    if (existing) {
      setSessionStatus('ready')
      return existing
    }
    setSessionStatus('loading')
    try {
      const data = await createSession()
      sessionStorage.setItem(STORAGE_TOKEN, data.session_token)
      sessionStorage.setItem(STORAGE_CONV, data.conversation_id)
      setSessionToken(data.session_token)
      setConversationId(data.conversation_id)
      setSessionStatus('ready')
      return data.session_token
    } catch (err) {
      setSessionStatus('error')
      setError({
        code: err.code || 'backend_error',
        message: err.message || "I can't reply just now.",
      })
      throw err
    }
  }, [sessionToken])

  const openPanel = useCallback(() => {
    setOpen(true)
    setError(null)
    ensureSession().catch(() => {})
  }, [ensureSession])

  const closePanel = useCallback(() => {
    setOpen(false)
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const resetSession = useCallback(async () => {
    sessionStorage.removeItem(STORAGE_TOKEN)
    sessionStorage.removeItem(STORAGE_CONV)
    setSessionToken('')
    setConversationId('')
    setMessages([])
    setPendingConfirm(null)
    setPendingChoices(null)
    setConfirmResult(null)
    setError(null)
    setSessionStatus('idle')
    try {
      await ensureSession(true)
    } catch {
      /* error already set */
    }
  }, [ensureSession])

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || streaming || pendingConfirm || pendingChoices) return

      setError(null)
      setConfirmResult(null)
      const localId = `local-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: localId, role: 'visitor', text: trimmed, status: 'sending' },
      ])
      setStreaming(true)
      streamBufRef.current = ''

      let token
      try {
        token = await ensureSession()
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: 'failed' } : m)),
        )
        setStreaming(false)
        return
      }

      const controller = new AbortController()
      abortRef.current = controller

      try {
        await streamChat({
          sessionToken: token,
          message: trimmed,
          page: pageContext,
          signal: controller.signal,
          onEvent: (event, payload) => {
            if (event === 'message_delta' && payload.text) {
              streamBufRef.current += payload.text
              const buf = streamBufRef.current
              setMessages((prev) => {
                const withoutFailedStream = prev.filter((m) => m.id !== 'stream')
                const withVisitor = withoutFailedStream.map((m) =>
                  m.id === localId ? { ...m, status: 'sent' } : m,
                )
                const idx = withVisitor.findIndex((m) => m.id === 'stream')
                if (idx === -1) {
                  return [
                    ...withVisitor,
                    { id: 'stream', role: 'attendant', text: buf, status: 'streaming' },
                  ]
                }
                const next = [...withVisitor]
                next[idx] = { ...next[idx], text: buf, status: 'streaming' }
                return next
              })
            }
            if (event === 'client_action') {
              applyClientAction(payload, { navigate })
            }
            if (event === 'escalation_status' && payload.escalation_state) {
              setEscalationState(payload.escalation_state)
            }
            if (event === 'confirmation_required') {
              setPendingConfirm({
                token: payload.token,
                summary: payload.summary,
                tool: payload.tool,
                expiresAt: payload.expires_at,
              })
            }
            if (event === 'choices') {
              setPendingChoices({
                id: payload.id,
                token: payload.token,
                prompt: payload.prompt,
                options: Array.isArray(payload.options) ? payload.options : [],
                multi: Boolean(payload.multi),
                expiresAt: payload.expires_at,
              })
            }
            if (event === 'error') {
              setError({
                code: payload.code || 'backend_error',
                message: payload.message || "I can't reply just now.",
              })
            }
            if (event === 'done') {
              if (payload.conversation_id) {
                setConversationId(payload.conversation_id)
                sessionStorage.setItem(STORAGE_CONV, payload.conversation_id)
              }
            }
          },
        })

        const finalText = streamBufRef.current
        setMessages((prev) => {
          const mapped = prev.map((m) => {
            if (m.id === localId) return { ...m, status: 'sent' }
            if (m.id === 'stream') {
              return {
                id: `att-${Date.now()}`,
                role: 'attendant',
                text: finalText,
                status: 'sent',
              }
            }
            return m
          })
          if (finalText && !mapped.some((m) => m.role === 'attendant' && m.text === finalText)) {
            return [
              ...mapped.filter((m) => m.id !== 'stream'),
              { id: `att-${Date.now()}`, role: 'attendant', text: finalText, status: 'sent' },
            ]
          }
          return mapped.filter((m) => m.id !== 'stream' || Boolean(finalText))
        })
      } catch (err) {
        if (err.name === 'AbortError') return
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: 'failed' } : m)),
        )
        setError({
          code: err.code || 'backend_error',
          message: err.message || "I can't reply just now.",
        })
      } finally {
        setStreaming(false)
        abortRef.current = null
        streamBufRef.current = ''
      }
    },
    [streaming, pendingConfirm, pendingChoices, ensureSession, pageContext, navigate],
  )

  const cancelConfirm = useCallback(() => {
    setPendingConfirm(null)
  }, [])

  const cancelChoices = useCallback(async () => {
    if (!pendingChoices?.token || !sessionToken) {
      setPendingChoices(null)
      return
    }
    setChoiceBusy(true)
    try {
      await selectChoice({
        sessionToken,
        choiceToken: pendingChoices.token,
        optionIds: [],
        page: pageContext,
        onEvent: () => {},
        cancel: true,
      })
    } catch {
      /* dismiss locally even if network fails */
    } finally {
      setPendingChoices(null)
      setChoiceBusy(false)
    }
  }, [pendingChoices, sessionToken, pageContext])

  const submitChoice = useCallback(
    async (optionIds) => {
      if (!pendingChoices?.token || !sessionToken || choiceBusy || streaming) return
      const ids = Array.isArray(optionIds) ? optionIds : [optionIds]
      if (ids.length === 0) return

      setChoiceBusy(true)
      setError(null)
      const labels = (pendingChoices.options || [])
        .filter((o) => ids.includes(o.id))
        .map((o) => o.label)
        .join('; ')
      const localId = `local-choice-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: localId,
          role: 'visitor',
          text: labels ? `I chose: ${labels}` : 'I chose an option',
          status: 'sending',
        },
      ])
      setPendingChoices(null)
      setStreaming(true)
      streamBufRef.current = ''

      const controller = new AbortController()
      abortRef.current = controller

      try {
        await selectChoice({
          sessionToken,
          choiceToken: pendingChoices.token,
          optionIds: ids,
          page: pageContext,
          signal: controller.signal,
          onEvent: (event, payload) => {
            if (event === 'message_delta' && payload.text) {
              streamBufRef.current += payload.text
              const buf = streamBufRef.current
              setMessages((prev) => {
                const withVisitor = prev.map((m) =>
                  m.id === localId ? { ...m, status: 'sent' } : m,
                )
                const idx = withVisitor.findIndex((m) => m.id === 'stream')
                if (idx === -1) {
                  return [
                    ...withVisitor,
                    { id: 'stream', role: 'attendant', text: buf, status: 'streaming' },
                  ]
                }
                const next = [...withVisitor]
                next[idx] = { ...next[idx], text: buf, status: 'streaming' }
                return next
              })
            }
            if (event === 'client_action') {
              applyClientAction(payload, { navigate })
            }
            if (event === 'escalation_status' && payload.escalation_state) {
              setEscalationState(payload.escalation_state)
            }
            if (event === 'confirmation_required') {
              setPendingConfirm({
                token: payload.token,
                summary: payload.summary,
                tool: payload.tool,
                expiresAt: payload.expires_at,
              })
            }
            if (event === 'choices') {
              setPendingChoices({
                id: payload.id,
                token: payload.token,
                prompt: payload.prompt,
                options: Array.isArray(payload.options) ? payload.options : [],
                multi: Boolean(payload.multi),
                expiresAt: payload.expires_at,
              })
            }
            if (event === 'error') {
              setError({
                code: payload.code || 'backend_error',
                message: payload.message || "I can't reply just now.",
              })
            }
            if (event === 'done' && payload.conversation_id) {
              setConversationId(payload.conversation_id)
              sessionStorage.setItem(STORAGE_CONV, payload.conversation_id)
            }
          },
        })

        const finalText = streamBufRef.current
        setMessages((prev) => {
          const mapped = prev.map((m) => {
            if (m.id === localId) return { ...m, status: 'sent' }
            if (m.id === 'stream') {
              return {
                id: `att-${Date.now()}`,
                role: 'attendant',
                text: finalText,
                status: 'sent',
              }
            }
            return m
          })
          return mapped.filter((m) => m.id !== 'stream' || Boolean(finalText))
        })
      } catch (err) {
        if (err.name === 'AbortError') return
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, status: 'failed' } : m)),
        )
        setError({
          code: err.code || 'backend_error',
          message: err.message || "I can't reply just now.",
        })
      } finally {
        setStreaming(false)
        setChoiceBusy(false)
        abortRef.current = null
        streamBufRef.current = ''
      }
    },
    [pendingChoices, sessionToken, choiceBusy, streaming, pageContext, navigate],
  )

  const submitConfirm = useCallback(async () => {
    if (!pendingConfirm?.token || !sessionToken || confirmBusy) return
    setConfirmBusy(true)
    setConfirmResult(null)
    try {
      const result = await confirmAction({
        sessionToken,
        confirmationToken: pendingConfirm.token,
      })
      setPendingConfirm(null)
      if (result.ok) {
        if (result.client_action) {
          applyClientAction(result.client_action, { navigate })
        }
        const tool = result.tool || pendingConfirm.tool || ''
        const handoff = result.client_action?.payment_handoff || result.data?.payment_handoff
        let line
        if (tool === 'start_order') {
          const ref =
            result.data?.order_id != null ? `Quote #${result.data.order_id}` : 'Quote request'
          line = handoff
            ? `${ref} received. Opening secure checkout — payment is completed there, not in this chat.`
            : `${ref} received. This is a request to the team, not a payment.`
        } else {
          const ref =
            result.data?.reference ||
            (result.data?.order_id != null ? `Order #${result.data.order_id}` : null)
          line = ref
            ? `Done. Reference ${ref}.`
            : result.data?.message || 'Request received.'
        }
        setConfirmResult({ ok: true, message: line })
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: 'system',
            text: line,
            status: 'sent',
          },
        ])
      } else {
        const msg =
          result.user_safe_error ||
          'I couldn\'t complete that just now. It was not sent.'
        setConfirmResult({ ok: false, message: msg })
        setMessages((prev) => [
          ...prev,
          { id: `sys-${Date.now()}`, role: 'system', text: msg, status: 'sent' },
        ])
      }
    } catch (err) {
      const msg = err.message || 'I couldn\'t complete that just now. It was not sent.'
      setConfirmResult({ ok: false, message: msg })
    } finally {
      setConfirmBusy(false)
    }
  }, [pendingConfirm, sessionToken, confirmBusy, navigate])

  const value = useMemo(
    () => ({
      open,
      openPanel,
      closePanel,
      pageContext,
      sessionStatus,
      messages,
      streaming,
      error,
      clearError,
      sendMessage,
      pendingConfirm,
      submitConfirm,
      cancelConfirm,
      confirmBusy,
      confirmResult,
      pendingChoices,
      submitChoice,
      cancelChoices,
      choiceBusy,
      resetSession,
      conversationId,
      escalationState,
    }),
    [
      open,
      openPanel,
      closePanel,
      pageContext,
      sessionStatus,
      messages,
      streaming,
      error,
      clearError,
      sendMessage,
      pendingConfirm,
      submitConfirm,
      cancelConfirm,
      confirmBusy,
      confirmResult,
      pendingChoices,
      submitChoice,
      cancelChoices,
      choiceBusy,
      resetSession,
      conversationId,
      escalationState,
    ],
  )

  return <AttendantContext.Provider value={value}>{children}</AttendantContext.Provider>
}

export function useAttendant() {
  const ctx = useContext(AttendantContext)
  if (!ctx) {
    throw new Error('useAttendant must be used within AttendantProvider')
  }
  return ctx
}
