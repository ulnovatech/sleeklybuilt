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
import { confirmAction, createSession, streamChat } from './api'
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
  const abortRef = useRef(null)
  const streamBufRef = useRef('')

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
      if (!trimmed || streaming || pendingConfirm) return

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
            if (event === 'confirmation_required') {
              setPendingConfirm({
                token: payload.token,
                summary: payload.summary,
                tool: payload.tool,
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
    [streaming, pendingConfirm, ensureSession, pageContext, navigate],
  )

  const cancelConfirm = useCallback(() => {
    setPendingConfirm(null)
  }, [])

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
        const ref =
          result.data?.reference ||
          (result.data?.order_id != null ? `Order #${result.data.order_id}` : null)
        const line = ref
          ? `Done. Reference ${ref}.`
          : result.data?.message || 'Request received.'
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
  }, [pendingConfirm, sessionToken, confirmBusy])

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
      resetSession,
      conversationId,
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
      resetSession,
      conversationId,
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
