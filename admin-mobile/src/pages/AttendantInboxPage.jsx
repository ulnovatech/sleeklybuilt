import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiChatAlt2, HiRefresh } from 'react-icons/hi'
import PullToRefresh from '../components/PullToRefresh'
import TopBar from '../components/layout/TopBar'
import { useOnAppResume } from '../hooks/useAppResume'
import { ApiError } from '../services/api'
import { listEscalations } from '../services/attendant'

function stateLabel(state) {
  if (state === 'human_active') return 'You are in'
  if (state === 'escalated') return 'Waiting'
  return state || '—'
}

export default function AttendantInboxPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (isRefresh = false) => {
    setError(null)
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await listEscalations()
      setRows(Array.isArray(data.escalations) ? data.escalations : [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load escalations')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useOnAppResume(load)

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…'
    if (rows.length === 0) return 'No open escalations'
    return `${rows.length} open`
  }, [loading, rows.length])

  return (
    <>
      <TopBar title="Attendant" subtitle={subtitle} />
      <PullToRefresh onRefresh={() => load(true)} refreshing={refreshing}>
        <main className="mx-auto max-w-lg px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/55">Human handoffs from the site attendant</p>
            <button
              type="button"
              onClick={() => load(true)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-white/70"
              aria-label="Refresh"
            >
              <HiRefresh className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => load()} className="mt-3 text-brand underline">
                Try again
              </button>
            </div>
          ) : null}

          {loading ? (
            <ul className="space-y-3" aria-busy="true" aria-label="Loading escalations">
              {[1, 2, 3].map((n) => (
                <li key={n} className="h-24 animate-pulse rounded-2xl bg-surface-card" />
              ))}
            </ul>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-surface-card p-6 text-center" role="status">
              <HiChatAlt2 className="mx-auto h-10 w-10 text-white/30" aria-hidden />
              <h2 className="mt-3 font-semibold text-white">Inbox clear</h2>
              <p className="mt-2 text-sm text-white/55">
                When the attendant escalates a visitor, the briefed thread appears here.
              </p>
            </div>
          ) : null}

          {!loading && rows.length > 0 ? (
            <ul className="space-y-3">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`/attendant/${row.id}`}
                    className="block rounded-2xl border border-white/10 bg-surface-card p-4 transition hover:border-brand/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {row.org_name || row.summary || 'Visitor'}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-white/55">
                          {row.summary || row.suggested_next_action || row.reason_code || 'Escalation'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/80">
                        {stateLabel(row.escalation_state)}
                      </span>
                    </div>
                    {row.reason_code ? (
                      <p className="mt-3 text-xs text-white/40">{row.reason_code}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </main>
      </PullToRefresh>
    </>
  )
}
