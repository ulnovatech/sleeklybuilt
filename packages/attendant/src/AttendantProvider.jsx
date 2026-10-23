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
import { confirmAction, createSession, pollMessages, selectChoice, streamChat } from './api.js'
import { applyClientAction } from './clientActions.js'
import { buildPageContext, pageIdFromPath } from './pageContext.js'

const STORAGE_TOKEN = 'sb_attendant_session'
const STORAGE_CONV = 'sb_attendant_conversation'
const STORAGE_RECENT = 'sb_attendant_recent_pages'
const STORAGE_MSGS = 'sb_attendant_messages'

const DEFAULT_SITE = {
  name: 'SleeklyBuilt',
  whatsapp: 'https://wa.me/256776770930',
  primaryPhone: '+256776770930',
  email: 'sales@sleeklybuilt.pro',
}

const AttendantContext = createContext(null)

/** Persist across browser restarts (migrate from older sessionStorage keys). */
function storageGet(key) {
  try {
    const fromLocal = localStorage.getItem(key)
    if (fromLocal != null && fromLocal !== '') return fromLocal
  } catch {
    /* ignore */
  }
  try {
    const fromSession = sessionStorage.getItem(key)
    if (fromSession != null && fromSession !== '') {
      try {
        localStorage.setItem(key, fromSession)
      } catch {
        /* ignore */
      }
      return fromSession
    }
  } catch {
    /* ignore */
  }
  return null
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function readCachedMessages(conversationId) {
  if (!conversationId) return []
  try {
    const raw = storageGet(STORAGE_MSGS)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || parsed.conversationId !== conversationId || !Array.isArray(parsed.messages)) {
      return []
    }
    return parsed.messages
  } catch {
    return []
  }
}

function writeCachedMessages(conversationId, messages) {
  if (!conversationId) return
  try {
    const slim = (messages || [])
      .filter((m) => m && m.text && m.role !== 'streaming')
      .slice(-80)
      .map((m) => ({
        id: m.id,
        serverId: m.serverId,
        role: m.role,
        text: m.text,
        status: m.status || 'sent',
      }))
    storageSet(
      STORAGE_MSGS,
      JSON.stringify({ conversationId, messages: slim, savedAt: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

function readRecent() {
  try {
    const raw = storageGet(STORAGE_RECENT)
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
  storageSet(STORAGE_RECENT, JSON.stringify(next))
  return next
}

function mapServerMessages(incoming, { includeVisitor = false } = {}) {
  const out = []
  for (const m of incoming || []) {
    if (!m) continue
    // Live poll skips visitor echoes; full hydrate needs both sides of the thread.
    if (m.role === 'visitor' && !includeVisitor) continue
    let role = 'attendant'
    if (m.role === 'human') role = 'human'
    else if (m.role === 'system') role = 'system'
    else if (m.role === 'visitor') role = 'visitor'
    out.push({
      id: `srv-${m.id}`,
      serverId: m.id,
      role,
      text: m.text,
      status: 'sent',
    })
  }
  return out
}

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   site?: Partial<typeof DEFAULT_SITE>,
 *   host?: 'marketing' | 'portfolio' | 'blog',
 *   basePath?: string,
 * }} props
 */
export function AttendantProvider({ children, site: siteProp, host = 'marketing', basePath = '' }) {
  const site = useMemo(
    () => ({
      ...DEFAULT_SITE,
      ...(siteProp || {}),
    }),
    [siteProp],
  )

  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [sessionToken, setSessionToken] = useState(() => storageGet(STORAGE_TOKEN) || '')
  const [conversationId, setConversationId] = useState(() => storageGet(STORAGE_CONV) || '')
  const [sessionStatus, setSessionStatus] = useState('idle') // idle | loading | ready | error
  const [messages, setMessages] = useState(() =>
    readCachedMessages(storageGet(STORAGE_CONV) || ''),
  )
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
  const pollFailRef = useRef(0)
  const hydratedRef = useRef(false)

  // Keep lastMsgId aligned with cached/server ids for resume polling.
  useEffect(() => {
    let max = 0
    for (const m of messages) {
      const n = Number(m.serverId || 0)
      if (Number.isFinite(n) && n > max) max = n
    }
    if (max > lastMsgIdRef.current) lastMsgIdRef.current = max
  }, [messages])

  useEffect(() => {
    if (conversationId) writeCachedMessages(conversationId, messages)
  }, [conversationId, messages])

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
        { host, basePath },
      ),
    [location.pathname, location.search, location.hash, recent, host, basePath],
  )

  useEffect(() => {
    pushRecent(pageIdFromPath(location.pathname, { host, basePath }))
  }, [location.pathname, host, basePath])

  // Poll while the panel is open so operator interjection (autonomous → human_active)
  // surfaces without waiting for the visitor's next turn. Faster when a human is in.
  useEffect(() => {
    if (!open || !sessionToken) return undefined

    const humanControlled =
      escalationState === 'escalated' || escalationState === 'human_active'
    const intervalMs = humanControlled ? 3000 : 8000

    let cancelled = false
    const tick = async () => {
      try {
        const data = await pollMessages({
          sessionToken,
          afterId: lastMsgIdRef.current,
        })
        if (cancelled) return
        pollFailRef.current = 0
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
      } catch (err) {
        pollFailRef.current += 1
        // Only surface poll errors when a human is already expected (escalated path).
        if (!cancelled && humanControlled && pollFailRef.current >= 3) {
          setError({
            code: err?.code || 'backend_error',
            message:
              err?.message ||
              'Live updates paused. Retry, or continue on WhatsApp if you need a human now.',
          })
        }
      }
    }

    pollFailRef.current = 0
    tick()
    const timer = window.setInterval(tick, intervalMs)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [open, escalationState, sessionToken])

  const hydrateFromServer = useCallback(async (token) => {
    if (!token) return false
    try {
      const data = await pollMessages({ sessionToken: token, afterId: 0 })
      if (data.escalation_state) setEscalationState(data.escalation_state)
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
        storageSet(STORAGE_CONV, data.conversation_id)
      }
      const mapped = mapServerMessages(data.messages, { includeVisitor: true })
      if (mapped.length > 0) {
        setMessages(mapped)
        let max = 0
        for (const m of mapped) {
          const n = Number(m.serverId || 0)
          if (n > max) max = n
        }
        lastMsgIdRef.current = max
      }
      hydratedRef.current = true
      return true
    } catch (err) {
      if (err?.code === 'unauthorized' || /invalid or expired/i.test(err?.message || '')) {
        return false
      }
      // Soft-fail hydrate — cached local messages still show.
      hydratedRef.current = true
      return true
    }
  }, [])

  const ensureSession = useCallback(async (force = false) => {
    const existing = !force && (sessionToken || storageGet(STORAGE_TOKEN) || '')
    if (existing) {
      const ok = await hydrateFromServer(existing)
      if (ok) {
        setSessionToken(existing)
        storageSet(STORAGE_TOKEN, existing)
        setSessionStatus('ready')
        return existing
      }
      // Expired token — fall through to a fresh session.
      storageRemove(STORAGE_TOKEN)
      storageRemove(STORAGE_CONV)
      storageRemove(STORAGE_MSGS)
      setSessionToken('')
      setConversationId('')
      setMessages([])
      lastMsgIdRef.current = 0
      hydratedRef.current = false
    }
    setSessionStatus('loading')
    try {
      const data = await createSession()
      storageSet(STORAGE_TOKEN, data.session_token)
      storageSet(STORAGE_CONV, data.conversation_id)
      setSessionToken(data.session_token)
      setConversationId(data.conversation_id)
      setSessionStatus('ready')
      hydratedRef.current = true
      return data.session_token
    } catch (err) {
      setSessionStatus('error')
      setError({
        code: err.code || 'backend_error',
        message: err.message || "I can't reply just now.",
      })
      throw err
    }
  }, [sessionToken, hydrateFromServer])

  const openPanel = useCallback(() => {
    setOpen(true)
    setMinimized(false)
    setError(null)
    ensureSession().catch(() => {})
  }, [ensureSession])

  const minimizePanel = useCallback(() => {
    setMinimized(true)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const resetSession = useCallback(async () => {
    storageRemove(STORAGE_TOKEN)
    storageRemove(STORAGE_CONV)
    storageRemove(STORAGE_MSGS)
    setSessionToken('')
    setConversationId('')
    setMessages([])
    lastMsgIdRef.current = 0
    hydratedRef.current = false
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
              applyClientAction(payload, { navigate, host })
            }
            if (event === 'escalation_status' && payload.escalation_state) {
              setEscalationState(payload.escalation_state)
              const notice = typeof payload.message === 'string' ? payload.message.trim() : ''
              if (notice) {
                setMessages((prev) => {
                  if (prev.some((m) => m.role === 'system' && m.text === notice)) return prev
                  return [
                    ...prev.filter((m) => m.id !== 'stream'),
                    {
                      id: `sys-${Date.now()}`,
                      role: 'system',
                      text: notice,
                      status: 'sent',
                    },
                  ]
                })
                streamBufRef.current = ''
              }
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
                storageSet(STORAGE_CONV, payload.conversation_id)
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

  /** Open the existing panel and optionally send a starter message (one widget instance). */
  const openWithPrompt = useCallback(
    (text) => {
      setOpen(true)
      setMinimized(false)
      setError(null)
      const trimmed = typeof text === 'string' ? text.trim() : ''
      if (!trimmed) {
        ensureSession().catch(() => {})
        return
      }
      void sendMessage(trimmed)
    },
    [ensureSession, sendMessage],
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
              applyClientAction(payload, { navigate, host })
            }
            if (event === 'escalation_status' && payload.escalation_state) {
              setEscalationState(payload.escalation_state)
              const notice = typeof payload.message === 'string' ? payload.message.trim() : ''
              if (notice) {
                setMessages((prev) => {
                  if (prev.some((m) => m.role === 'system' && m.text === notice)) return prev
                  return [
                    ...prev.filter((m) => m.id !== 'stream'),
                    {
                      id: `sys-${Date.now()}`,
                      role: 'system',
                      text: notice,
                      status: 'sent',
                    },
                  ]
                })
                streamBufRef.current = ''
              }
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
              storageSet(STORAGE_CONV, payload.conversation_id)
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
          applyClientAction(result.client_action, { navigate, host })
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
      site,
      open,
      minimized,
      openPanel,
      openWithPrompt,
      minimizePanel,
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
      site,
      open,
      minimized,
      openPanel,
      openWithPrompt,
      minimizePanel,
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
