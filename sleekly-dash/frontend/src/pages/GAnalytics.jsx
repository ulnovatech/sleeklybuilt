import { useEffect, useMemo, useState } from 'react'
import KPICard from '../components/KPICard'
import LineChartNeon from '../components/LineChartNeon'
import { AnalyticsAPI } from '../services/api'

const SECONDARY_METRICS = [
  { title: 'New users', key: 'newUsers', yLabel: 'Users' },
  { title: 'Page views', key: 'pageViews', yLabel: 'Views' },
  { title: 'Avg. session', key: 'averageSessionDuration', yLabel: 'Minutes' },
  { title: 'Bounce rate', key: 'bounceRate', yLabel: 'Bounce Rate (%)' },
]

function formatDuration(seconds) {
  const n = Number(seconds) || 0
  if (n <= 0) return '0:00'
  const m = Math.floor(n / 60)
  const s = Math.round(n % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function seriesFor(rows, key) {
  return rows.map((row, idx) => {
    let value = Number(row[key]) || 0
    if (key === 'averageSessionDuration') value = value / 60
    return {
      time: row.label || row.date || `Day ${idx + 1}`,
      value,
    }
  })
}

function normalizePayload(data) {
  if (Array.isArray(data)) {
    return {
      ok: true,
      range: '30d',
      totals: null,
      series: data.map((row) => ({
        ...row,
        date: row.date,
        label: row.date,
      })),
      pages: [],
      events: [],
    }
  }
  return data
}

export default function GAnalytics() {
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [code, setCode] = useState(null)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setCode(null)
      try {
        const data = await AnalyticsAPI.ga()
        if (data?.ok === false || data?.error) {
          const err = new Error(data.error || 'Failed to load GA data')
          err.code = data.code || 'ga_error'
          throw err
        }
        if (!cancelled) setPayload(normalizePayload(data))
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unknown error')
          setCode(err.code || err.status || 'unknown')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const series = useMemo(() => payload?.series || [], [payload])
  const totals = payload?.totals
  const sessionChart = useMemo(() => seriesFor(series, 'sessions'), [series])

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-slate-800" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-800/70" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-900/60" />
          ))}
        </div>
        <div className="card h-[320px] animate-pulse bg-slate-900/40" />
      </div>
    )
  }

  if (error) {
    const setup = code === 'credentials_missing' || code === 'property_missing'
    return (
      <div className="card max-w-xl space-y-3" role="alert">
        <h2 className="text-lg font-semibold text-white">Analytics isn’t connected yet</h2>
        <p className="text-sm text-muted">
          {error}
        </p>
        {setup && (
          <p className="text-sm text-slate-300">
            On the server, set <code className="text-white">GA_PROPERTY_ID</code> (Admin → Property
            details — a number, not <code className="text-white">G-ER55WHMLGZ</code>) and place the
            service-account JSON where the API can read it. Grant that account Viewer on the property.
          </p>
        )}
        <button type="button" className="btn-secondary w-fit" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    )
  }

  if (!series.length) {
    return (
      <div className="card max-w-xl space-y-2">
        <h2 className="text-lg font-semibold text-white">Waiting for the first visits</h2>
        <p className="text-sm text-muted">
          The tag is wired, but GA4 has no rows for the last 30 days yet. Open the live site, then
          check Realtime in Google Analytics — summaries here usually land within a day.
        </p>
      </div>
    )
  }

  const kpis = [
    { title: 'Active users', value: totals ? totals.activeUsers.toLocaleString() : '—', delta: '' },
    { title: 'Sessions', value: totals ? totals.sessions.toLocaleString() : '—', delta: '' },
    { title: 'Leads', value: totals ? String(totals.leads ?? 0) : '—', delta: '' },
    { title: 'WhatsApp taps', value: totals ? String(totals.whatsappClicks ?? 0) : '—', delta: '' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Site analytics</h2>
          <p className="text-sm text-muted">
            sleeklybuilt.pro · last 30 days
            {totals ? ` · avg session ${formatDuration(totals.averageSessionDuration)} · bounce ${totals.bounceRate}%` : ''}
          </p>
        </div>
        <a
          href="https://analytics.google.com/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-violet-300 hover:text-white focus:outline-none focus-visible:underline"
        >
          Open Google Analytics
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KPICard key={k.title} title={k.title} value={k.value} delta={k.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Sessions</h3>
            <p className="text-sm text-muted">Daily sessions from the public site</p>
          </div>
          <LineChartNeon data={sessionChart} dataKey="value" yLabel="Sessions" framed={false} />
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold">Top pages</h3>
            {payload.pages?.length ? (
              <ul className="space-y-2">
                {payload.pages.map((page) => (
                  <li key={page.path} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate text-white">{page.title}</div>
                      <div className="truncate text-xs text-muted">{page.path}</div>
                    </div>
                    <div className="shrink-0 font-semibold tabular-nums">{page.views}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                Page paths appear after SPA page views reach GA4. Visit a few public routes, then come back.
              </p>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold">Events that matter</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted">generate_lead</span>
                <span className="font-semibold">{totals?.leads ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted">whatsapp_click</span>
                <span className="font-semibold">{totals?.whatsappClicks ?? 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="btn-secondary"
          aria-expanded={showMore}
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? 'Hide extra metrics' : 'Show extra metrics'}
        </button>
      </div>

      {showMore && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SECONDARY_METRICS.map((metric) => (
            <div key={metric.key} className="card">
              <h3 className="mb-3 text-lg font-semibold">{metric.title}</h3>
              <LineChartNeon
                data={seriesFor(series, metric.key)}
                dataKey="value"
                yLabel={metric.yLabel}
                framed={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
