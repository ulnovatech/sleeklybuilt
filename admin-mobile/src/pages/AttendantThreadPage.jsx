import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'
import toast from 'react-hot-toast'
import TopBar from '../components/layout/TopBar'
import { useOnAppResume } from '../hooks/useAppResume'
import { ApiError } from '../services/api'
import {
  getConversation,
  postOperatorMessage,
  resumeConversation,
  takeoverConversation,
} from '../services/attendant'

function BriefPanel({ brief }) {
  if (!brief || typeof brief !== 'object') return null
  const customer = brief.customer || {}
  return (
    <section className="rounded-2xl border border-white/10 bg-surface-card p-4 text-sm">
      <h2 className="font-semibold text-white">Operator brief</h2>
      {brief.summary ? <p className="mt-2 text-white/80">{brief.summary}</p> : null}
      <dl className="mt-3 space-y-2 text-white/60">
        {customer.org_name ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/35">Org</dt>
            <dd>{customer.org_name}</dd>
          </div>
        ) : null}
        {customer.objective ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/35">Objective</dt>
            <dd>{customer.objective}</dd>
          </div>
        ) : null}
        {brief.reason_code ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/35">Reason</dt>
            <dd>
              {brief.reason_code}
              {brief.reason ? ` — ${brief.reason}` : ''}
            </dd>
          </div>
        ) : null}
        {brief.suggested_next_action ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/35">Suggested next</dt>
            <dd>{brief.suggested_next_action}</dd>
          </div>
        ) : null}
        {brief.order_package || brief.recommendation?.package ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/35">Package</dt>
            <dd>{brief.order_package || brief.recommendation?.package}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}

export default function AttendantThreadPage() {
  const { id = '' } = useParams()
  const formId = useId()
  const bottomRef = useRef(null)
  const [conv, setConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!id) return
    setError(null)
    setLoading(true)
    try {
      const data = await getConversation(id)
      setConv(data.conversation || null)
      setMessages(Array.isArray(data.messages) ? data.messages : [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load thread')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useOnAppResume(load)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const state = conv?.escalation_state || ''

  const onTakeover = async () => {
    setBusy(true)
    try {
      await takeoverConversation(id)
      toast.success('You have taken over')
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Takeover failed')
    } finally {
      setBusy(false)
    }
  }

  const onResume = async () => {
    setBusy(true)
    try {
      await resumeConversation(id)
      toast.success('Returned to AI')
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Resume failed')
    } finally {
      setBusy(false)
    }
  }

  const onSend = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || busy) return
    setBusy(true)
    const key = `op-${id}-${Date.now()}`
    try {
      await postOperatorMessage(id, body, key)
      setText('')
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Send failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-white">
      <TopBar
        title="Thread"
        subtitle={state || '—'}
        leading={
          <Link
            to="/attendant"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-white/80"
            aria-label="Back to attendant inbox"
          >
            <HiArrowLeft className="h-5 w-5" />
          </Link>
        }
      />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-28 pt-3">
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
            <p>{error}</p>
            <button type="button" onClick={load} className="mt-3 text-brand underline">
              Try again
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <div className="h-32 animate-pulse rounded-2xl bg-surface-card" />
            <div className="h-20 animate-pulse rounded-2xl bg-surface-card" />
          </div>
        ) : null}

        {!loading && conv ? (
          <>
            <BriefPanel brief={conv.operator_brief} />

            <div className="mt-4 flex flex-wrap gap-2">
              {state === 'escalated' ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onTakeover}
                  className="min-h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-ink disabled:opacity-50"
                >
                  Take over
                </button>
              ) : null}
              {state === 'human_active' || state === 'escalated' ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onResume}
                  className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white/85 disabled:opacity-50"
                >
                  Return to AI
                </button>
              ) : null}
            </div>

            <ul className="mt-6 flex-1 space-y-3" aria-label="Conversation">
              {messages.map((m) => {
                const mine = m.role === 'human'
                const system = m.role === 'system'
                return (
                  <li
                    key={m.id}
                    className={[
                      'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm',
                      system
                        ? 'mx-auto bg-white/5 text-center text-white/50'
                        : mine
                          ? 'ml-auto bg-brand/90 text-ink'
                          : 'mr-auto bg-surface-card text-white/90',
                    ].join(' ')}
                  >
                    {!system && !mine ? (
                      <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-white/40">
                        {m.role === 'visitor' ? 'Visitor' : 'Attendant'}
                      </span>
                    ) : null}
                    {mine ? (
                      <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-ink/60">You</span>
                    ) : null}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </li>
                )
              })}
              <li ref={bottomRef} aria-hidden className="h-1" />
            </ul>
          </>
        ) : null}
      </main>

      <form
        id={formId}
        onSubmit={onSend}
        className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-surface-card/95 px-4 py-3 backdrop-blur-md"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <label className="sr-only" htmlFor={`${formId}-input`}>
            Reply to visitor
          </label>
          <input
            id={`${formId}-input`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Reply to the visitor…"
            disabled={busy || state === 'autonomous'}
            className="min-h-11 flex-1 rounded-xl border border-white/10 bg-surface px-3 text-sm text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={busy || !text.trim() || state === 'autonomous'}
            className="min-h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
