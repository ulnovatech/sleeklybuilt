/**
 * Payments verification queue — UX-GATE C4 + Phase 5 reconciliation
 */

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { PaymentsAPI } from '../services/api'

const FILTERS = [
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'ambiguous', label: 'Ambiguous' },
  { id: 'unmatched', label: 'Unmatched' },
  { id: 'overpaid', label: 'Overpaid' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
]

const emptyUnmatched = {
  provider: 'mtn',
  transaction_reference: '',
  actual_payer_phone: '',
  actual_payer_name: '',
  amount_ugx: '',
  transaction_at: '',
  notes: '',
}

function ageLabel(iso) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return 'just now'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function providerLabel(p) {
  if (p === 'mtn') return 'MTN'
  if (p === 'airtel') return 'Airtel'
  return p || '—'
}

function fieldClass() {
  return 'mt-1 w-full rounded-lg border border-gray-700 bg-bg-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-purple/60'
}

export default function Payments() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('awaiting')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRecord, setShowRecord] = useState(false)
  const [form, setForm] = useState(emptyUnmatched)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [attaching, setAttaching] = useState(null)
  const [adapters, setAdapters] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await PaymentsAPI.queue({ filter })
      setData(res)
      try {
        const a = await PaymentsAPI.adapters()
        setAdapters(a)
      } catch {
        setAdapters(null)
      }
    } catch (err) {
      setError(err?.message || 'Could not load payments queue.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const counts = data?.counts || {}
  const items = data?.items || []
  const unmatched = data?.unmatched_transactions || []

  const recordUnmatched = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      await PaymentsAPI.recordUnmatched({
        ...form,
        amount_ugx: Number(form.amount_ugx),
      })
      setForm(emptyUnmatched)
      setSaveMsg('Unmatched transaction saved. It stays in the queue until attached.')
      setFilter('unmatched')
      await load()
    } catch (err) {
      setSaveMsg(err?.message || 'Could not save unmatched transaction.')
    } finally {
      setSaving(false)
    }
  }

  const attach = async (txnId, claimId, acceptOverpay = false) => {
    setAttaching(`${txnId}-${claimId}`)
    setError('')
    try {
      await PaymentsAPI.attachUnmatched(txnId, {
        claim_id: claimId,
        accept_overpay: acceptOverpay,
        force_confirm: false,
      })
      navigate(`/payments/${claimId}`)
    } catch (err) {
      if (err?.body?.code === 'overpayment') {
        if (window.confirm('This amount is an overpayment. Attach and accept overpay?')) {
          try {
            await PaymentsAPI.attachUnmatched(txnId, {
              claim_id: claimId,
              accept_overpay: true,
            })
            navigate(`/payments/${claimId}`)
            return
          } catch (err2) {
            setError(err2?.message || 'Attach failed.')
          }
        }
      } else if (err?.body?.code === 'ambiguous') {
        if (window.confirm('Match is ambiguous. Attach anyway after review?')) {
          try {
            await PaymentsAPI.attachUnmatched(txnId, {
              claim_id: claimId,
              force_confirm: true,
              accept_overpay: true,
            })
            navigate(`/payments/${claimId}`)
            return
          } catch (err2) {
            setError(err2?.message || 'Attach failed.')
          }
        }
      } else {
        setError(err?.message || 'Could not attach transaction.')
      }
    } finally {
      setAttaching(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="mt-1 text-sm text-slate-400">
            Verify merchant Mobile Money against customer claims. Oldest waiting first.
          </p>
          {adapters?.production_evidence_path ? (
            <p className="mt-2 text-xs text-slate-500">
              Evidence path: <span className="font-medium text-slate-300">manual admin entry</span>
              {' · '}
              Official API adapters stubbed (SMS scrape forbidden).
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowRecord((v) => !v)}
            className="min-h-11 rounded-lg border border-gray-600 px-4 text-sm font-semibold text-slate-100 hover:bg-gray-800"
          >
            {showRecord ? 'Hide record form' : 'Record unmatched txn'}
          </button>
          <Link
            to="/settings"
            className="inline-flex min-h-11 items-center text-sm font-medium text-indigo-300 underline-offset-2 hover:underline"
          >
            Payment settings
          </Link>
        </div>
      </header>

      {showRecord ? (
        <form
          onSubmit={recordUnmatched}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5"
        >
          <h2 className="text-base font-semibold text-white">Record unmatched merchant transaction</h2>
          <p className="mt-1 text-sm text-slate-400">
            Money arrived with no matching claim yet. Saved here — never discarded.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300" htmlFor="um-provider">
                Provider
              </label>
              <select
                id="um-provider"
                className={fieldClass()}
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              >
                <option value="mtn">MTN</option>
                <option value="airtel">Airtel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300" htmlFor="um-ref">
                Transaction reference
              </label>
              <input
                id="um-ref"
                required
                className={fieldClass()}
                value={form.transaction_reference}
                onChange={(e) => setForm((f) => ({ ...f, transaction_reference: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300" htmlFor="um-phone">
                Payer phone
              </label>
              <input
                id="um-phone"
                required
                className={fieldClass()}
                value={form.actual_payer_phone}
                onChange={(e) => setForm((f) => ({ ...f, actual_payer_phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300" htmlFor="um-name">
                Registered name
              </label>
              <input
                id="um-name"
                className={fieldClass()}
                value={form.actual_payer_name}
                onChange={(e) => setForm((f) => ({ ...f, actual_payer_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300" htmlFor="um-amount">
                Amount (UGX)
              </label>
              <input
                id="um-amount"
                required
                inputMode="numeric"
                className={fieldClass()}
                value={form.amount_ugx}
                onChange={(e) => setForm((f) => ({ ...f, amount_ugx: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300" htmlFor="um-at">
                Date / time
              </label>
              <input
                id="um-at"
                required
                type="datetime-local"
                className={fieldClass()}
                value={form.transaction_at}
                onChange={(e) => setForm((f) => ({ ...f, transaction_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm text-slate-300" htmlFor="um-notes">
              Notes
            </label>
            <textarea
              id="um-notes"
              rows={2}
              className={fieldClass()}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          {saveMsg ? <p className="mt-3 text-sm text-slate-200">{saveMsg}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="mt-4 min-h-11 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save unmatched'}
          </button>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Payment queues">
        {FILTERS.map((f) => {
          const count = counts[f.id]
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                active
                  ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white'
                  : 'border border-gray-700 bg-bg-850 text-slate-300 hover:bg-gray-800/60'
              }`}
            >
              {f.label}
              {typeof count === 'number' ? (
                <span className="ml-2 tabular-nums opacity-80">({count})</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading payments">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-800/60" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert">
          <p className="flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-11 rounded-lg border border-rose-400/40 px-4 text-sm font-semibold text-rose-100 hover:bg-rose-500/20"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && filter !== 'unmatched' && items.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-bg-850/50 p-8 text-center">
          <p className="text-lg font-semibold text-white">No payments in this queue</p>
          <p className="mt-2 text-sm text-slate-400">
            {counts.unmatched > 0 ? (
              <>
                There {counts.unmatched === 1 ? 'is' : 'are'} {counts.unmatched} unmatched merchant transaction
                {counts.unmatched === 1 ? '' : 's'}.{' '}
                <button
                  type="button"
                  className="font-semibold text-indigo-300 underline-offset-2 hover:underline"
                  onClick={() => setFilter('unmatched')}
                >
                  View unmatched
                </button>
              </>
            ) : (
              'New customer claims appear after they tap “I’ve completed payment”.'
            )}
          </p>
        </div>
      ) : null}

      {!loading && !error && filter !== 'unmatched' ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.claim_id}
              className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-bg-850/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">
                  {item.customer_name} · {item.package_title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {item.amount_label} · {providerLabel(item.provider)} · {ageLabel(item.submitted_at)}
                  {item.status === 'overpaid' ? ' · overpaid' : ''}
                  {item.status === 'ambiguous' ? ' · needs review' : ''}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">{item.claim_ref}</p>
              </div>
              <Link
                to={`/payments/${item.claim_id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue px-5 text-sm font-semibold text-white shadow-neon-lg hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Review
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && !error && filter === 'unmatched' ? (
        unmatched.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-bg-850/50 p-8 text-center text-slate-400">
            No unmatched merchant transactions. Use “Record unmatched txn” when SMS shows money with no claim.
          </div>
        ) : (
          <ul className="space-y-4">
            {unmatched.map((txn) => (
              <li key={txn.id} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="font-semibold text-white">
                  {providerLabel(txn.provider)} · UGX {Number(txn.amount_ugx).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Ref <span className="font-mono">{txn.transaction_reference}</span> · {txn.actual_payer_phone}
                </p>
                <p className="mt-1 text-xs text-slate-500">{txn.transaction_at}</p>
                {txn.suggested_claims?.length ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/80">
                      Suggested claims
                    </p>
                    {txn.suggested_claims.map((c) => (
                      <div
                        key={c.claim_id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-700 bg-bg-900/50 px-3 py-2"
                      >
                        <div className="text-sm text-slate-200">
                          <span className="font-mono text-indigo-300">{c.claim_ref}</span> · {c.customer_name} · UGX{' '}
                          {Number(c.amount_ugx).toLocaleString()}
                        </div>
                        <button
                          type="button"
                          disabled={attaching === `${txn.id}-${c.claim_id}`}
                          onClick={() => attach(txn.id, c.claim_id)}
                          className="min-h-11 rounded-lg border border-indigo-400/40 px-3 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/10 disabled:opacity-60"
                        >
                          {attaching === `${txn.id}-${c.claim_id}` ? 'Attaching…' : 'Attach'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No strong claim candidates yet. Wait for a customer claim.</p>
                )}
                <Link
                  to={`/payments?filter=awaiting`}
                  className="mt-3 inline-flex text-sm text-indigo-300 underline-offset-2 hover:underline"
                  onClick={(e) => {
                    e.preventDefault()
                    setFilter('awaiting')
                  }}
                >
                  Browse awaiting claims
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  )
}
