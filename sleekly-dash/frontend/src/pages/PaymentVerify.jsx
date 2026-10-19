/**
 * Payment verify detail — UX-GATE C5
 * Claim (read-only) + merchant txn evidence + match + Confirm payment
 */

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { PaymentsAPI } from '../services/api'

const emptyTxn = {
  provider: 'mtn',
  transaction_reference: '',
  actual_payer_phone: '',
  actual_payer_name: '',
  amount_ugx: '',
  transaction_at: '',
  notes: '',
}

function fieldClass(err) {
  return `mt-1 w-full rounded-lg border bg-bg-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/60 ${
    err ? 'border-rose-500/60' : 'border-gray-700'
  }`
}

export default function PaymentVerify() {
  const { claimId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claim, setClaim] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [activation, setActivation] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [retryingNotify, setRetryingNotify] = useState(false)
  const [form, setForm] = useState(emptyTxn)
  const [fieldErrors, setFieldErrors] = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [matching, setMatching] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess] = useState('')
  const [forceConfirm, setForceConfirm] = useState(false)
  const [needsForce, setNeedsForce] = useState(false)
  const [acceptOverpay, setAcceptOverpay] = useState(false)
  const [needsOverpay, setNeedsOverpay] = useState(false)
  const [dupLink, setDupLink] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await PaymentsAPI.get(claimId)
      setClaim(data.claim)
      setReceipt(data.receipt)
      setActivation(data.activation)
      setNotifications(Array.isArray(data.notifications) ? data.notifications : [])
      setForm((prev) => ({
        ...prev,
        provider: data.claim?.provider || 'mtn',
        amount_ugx: data.claim?.amount_ugx ? String(data.claim.amount_ugx) : '',
        actual_payer_phone: data.claim?.claimed_payer_phone || '',
        actual_payer_name: data.claim?.claimed_payer_name || '',
      }))
    } catch (err) {
      setError(err?.message || 'Could not load claim.')
      setClaim(null)
    } finally {
      setLoading(false)
    }
  }, [claimId])

  useEffect(() => {
    load()
  }, [load])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess('')
    setAnalysis(null)
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const payload = () => ({
    provider: form.provider,
    transaction_reference: form.transaction_reference.trim(),
    actual_payer_phone: form.actual_payer_phone.trim(),
    actual_payer_name: form.actual_payer_name.trim(),
    amount_ugx: Number(form.amount_ugx),
    transaction_at: form.transaction_at,
    notes: form.notes.trim(),
    force_confirm: forceConfirm,
    accept_overpay: acceptOverpay,
  })

  const runMatch = async () => {
    setMatching(true)
    setError('')
    setFieldErrors({})
    try {
      const res = await PaymentsAPI.match(claimId, payload())
      setAnalysis(res.analysis)
    } catch (err) {
      const details = err?.body?.details
      if (details && typeof details === 'object') setFieldErrors(details)
      setError(err?.message || 'Could not run match.')
    } finally {
      setMatching(false)
    }
  }

  const confirm = async () => {
    setConfirming(true)
    setError('')
    setFieldErrors({})
    setSuccess('')
    try {
      const res = await PaymentsAPI.confirm(claimId, payload())
      setClaim(res.claim)
      setReceipt(res.receipt)
      setActivation(res.activation)
      setNotifications(Array.isArray(res.notifications) ? res.notifications : [])
      setSuccess('Payment confirmed. Receipt issued.')
      setTimeout(() => navigate('/payments'), 1200)
    } catch (err) {
      const details = err?.body?.details
      if (details && typeof details === 'object') setFieldErrors(details)
      if (err?.body?.analysis) setAnalysis(err.body.analysis)
      if (err?.body?.code === 'ambiguous') {
        setNeedsForce(true)
        setForceConfirm(false)
      }
      if (err?.body?.code === 'overpayment') {
        setNeedsOverpay(true)
        setAcceptOverpay(false)
        if (err?.body?.analysis) setAnalysis(err.body.analysis)
      }
      if (err?.body?.code === 'duplicate_reference') {
        setDupLink({
          claimId: err.body.existing_claim_id,
          claimRef: err.body.existing_claim_ref,
        })
      }
      setError(err?.message || 'Could not confirm payment.')
    } finally {
      setConfirming(false)
    }
  }

  const retryNotify = async () => {
    setRetryingNotify(true)
    setError('')
    try {
      const res = await PaymentsAPI.retryNotify(claimId)
      setActivation(res.activation)
      setNotifications(Array.isArray(res.notifications) ? res.notifications : [])
      setSuccess('Notification retry finished.')
    } catch (err) {
      setError(err?.message || 'Could not retry notifications.')
    } finally {
      setRetryingNotify(false)
    }
  }

  const saveUnmatched = async () => {
    setConfirming(true)
    setError('')
    try {
      const res = await PaymentsAPI.confirm(claimId, { ...payload(), save_as_unmatched: true })
      setSuccess(res.message || 'Saved as unmatched. Claim stays open.')
    } catch (err) {
      if (err?.body?.code === 'duplicate_reference') {
        setDupLink({
          claimId: err.body.existing_claim_id,
          claimRef: err.body.existing_claim_ref,
        })
      }
      setError(err?.message || 'Could not save unmatched transaction.')
    } finally {
      setConfirming(false)
    }
  }

  const markAmbiguous = async () => {
    try {
      await PaymentsAPI.markAmbiguous(claimId)
      navigate('/payments?filter=ambiguous')
    } catch (err) {
      setError(err?.message || 'Could not mark ambiguous.')
    }
  }

  const reject = async (status) => {
    if (!window.confirm(status === 'not_found' ? 'Mark payment as not found?' : 'Reject this claim?')) return
    try {
      await PaymentsAPI.reject(claimId, { status, notes: form.notes })
      navigate('/payments')
    } catch (err) {
      setError(err?.message || 'Action failed.')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6" aria-busy="true">
        <div className="h-8 w-48 rounded bg-gray-800" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-gray-800/60" />
          <div className="h-64 rounded-xl bg-gray-800/60" />
        </div>
      </div>
    )
  }

  if (error && !claim) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-rose-300" role="alert">
          {error}
        </p>
        <Link to="/payments" className="text-indigo-300 underline">
          Back to payments
        </Link>
      </div>
    )
  }

  const closed = claim && !['awaiting_verification', 'ambiguous', 'not_found'].includes(claim.status)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-28 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{claim?.claim_ref}</p>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Verify payment</h1>
        </div>
        <Link
          to="/payments"
          className="inline-flex min-h-11 items-center rounded-lg bg-gray-800 px-4 text-sm text-white hover:bg-gray-700"
        >
          Back to queue
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          <span className="inline-flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </span>
        </p>
      ) : null}

      {success ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200" role="status">
          <CheckCircleIcon className="h-5 w-5" />
          {success}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-800 bg-bg-850/40 p-4 sm:p-5" aria-labelledby="claim-pane">
          <h2 id="claim-pane" className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Customer claim
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ['Customer', claim?.customer_name],
              ['Contact (do not overwrite)', `${claim?.country_code || ''} ${claim?.customer_phone || ''}`.trim()],
              ['Email', claim?.customer_email],
              ['Package', claim?.package_title],
              ['Expected', claim?.amount_label],
              ['Provider', claim?.provider?.toUpperCase()],
              ['Claimed payer', `${claim?.claimed_payer_name || '—'} · ${claim?.claimed_payer_phone || ''}`],
              ['Submitted', claim?.submitted_at],
              ['Status', claim?.status],
              ['Layout', claim?.template_key],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-gray-800/80 pb-2">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-100">{value || '—'}</dd>
              </div>
            ))}
          </dl>
          {receipt ? (
            <p className="mt-4 text-sm text-emerald-300">
              Receipt {receipt.receipt_number} · {receipt.issued_at}
            </p>
          ) : null}
          {activation ? (
            <div className="mt-4 rounded-lg border border-gray-700 bg-bg-900/60 p-3 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">Activation</p>
              <p className="mt-1">
                {activation.result || '—'}
                {activation.template_reserved || activation.reserved
                  ? ' · template reserved'
                  : ''}
              </p>
            </div>
          ) : null}
          {notifications.length ? (
            <div className="mt-4 rounded-lg border border-gray-700 bg-bg-900/60 p-3 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">Notifications</p>
              <ul className="mt-2 space-y-1">
                {notifications.map((n) => (
                  <li key={`${n.channel}-${n.sent_at || n.status}`}>
                    {n.channel}: <span className="font-medium text-white">{n.status}</span>
                    {n.last_error ? ` — ${n.last_error}` : ''}
                  </li>
                ))}
              </ul>
              {closed ? (
                <button
                  type="button"
                  onClick={retryNotify}
                  disabled={retryingNotify}
                  className="mt-3 min-h-11 rounded-lg border border-gray-600 px-3 text-sm font-semibold text-slate-100 hover:bg-gray-800 disabled:opacity-60"
                >
                  {retryingNotify ? 'Retrying…' : 'Retry notifications'}
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-gray-800 bg-bg-850/40 p-4 sm:p-5" aria-labelledby="txn-pane">
          <h2 id="txn-pane" className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Actual transaction
          </h2>
          <p className="mt-1 text-xs text-slate-500">Enter what the merchant account / SMS shows.</p>

          <fieldset disabled={closed || confirming} className="mt-4 space-y-4">
            <div>
              <label htmlFor="txn-provider" className="block text-sm font-medium text-slate-200">
                Provider
              </label>
              <select
                id="txn-provider"
                className={fieldClass(false)}
                value={form.provider}
                onChange={(e) => update('provider', e.target.value)}
              >
                <option value="mtn">MTN</option>
                <option value="airtel">Airtel</option>
              </select>
            </div>
            <div>
              <label htmlFor="txn-ref" className="block text-sm font-medium text-slate-200">
                Transaction reference
              </label>
              <input
                id="txn-ref"
                className={fieldClass(fieldErrors.transaction_reference)}
                value={form.transaction_reference}
                onChange={(e) => update('transaction_reference', e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="txn-phone" className="block text-sm font-medium text-slate-200">
                  Payer phone
                </label>
                <input
                  id="txn-phone"
                  className={fieldClass(fieldErrors.actual_payer_phone)}
                  value={form.actual_payer_phone}
                  onChange={(e) => update('actual_payer_phone', e.target.value)}
                  inputMode="tel"
                />
              </div>
              <div>
                <label htmlFor="txn-name" className="block text-sm font-medium text-slate-200">
                  Registered name
                </label>
                <input
                  id="txn-name"
                  className={fieldClass(false)}
                  value={form.actual_payer_name}
                  onChange={(e) => update('actual_payer_name', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="txn-amount" className="block text-sm font-medium text-slate-200">
                  Amount (UGX)
                </label>
                <input
                  id="txn-amount"
                  className={fieldClass(fieldErrors.amount_ugx)}
                  value={form.amount_ugx}
                  onChange={(e) => update('amount_ugx', e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label htmlFor="txn-at" className="block text-sm font-medium text-slate-200">
                  Date / time
                </label>
                <input
                  id="txn-at"
                  type="datetime-local"
                  className={fieldClass(fieldErrors.transaction_at)}
                  value={form.transaction_at}
                  onChange={(e) => update('transaction_at', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="txn-notes" className="block text-sm font-medium text-slate-200">
                Notes
              </label>
              <textarea
                id="txn-notes"
                rows={2}
                className={fieldClass(false)}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
              />
            </div>
          </fieldset>

          {!closed ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runMatch}
                disabled={matching || confirming}
                className="min-h-11 rounded-lg border border-gray-600 px-4 text-sm font-semibold text-slate-100 hover:bg-gray-800 disabled:opacity-60"
              >
                {matching ? 'Matching…' : 'Find match'}
              </button>
            </div>
          ) : null}

          {analysis ? (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm ${
                analysis.confidence === 'high'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                  : analysis.confidence === 'ambiguous'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-100'
                    : 'border-gray-600 bg-gray-800/50 text-slate-200'
              }`}
              role="status"
            >
              <p className="font-semibold capitalize">{analysis.confidence} confidence</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {(analysis.summary || []).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {analysis.competing?.length ? (
                <ul className="mt-3 space-y-1 border-t border-white/10 pt-2">
                  {analysis.competing.map((c) => (
                    <li key={c.claim_id}>
                      <Link className="text-indigo-300 underline" to={`/payments/${c.claim_id}`}>
                        {c.claim_ref}
                      </Link>{' '}
                      · {c.customer_name}
                    </li>
                  ))}
                </ul>
              ) : null}
              {analysis.checks?.amount === 'partial' || analysis.checks?.amount === 'over' ? (
                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs sm:text-sm">
                  <div>
                    <dt className="text-slate-400">Required</dt>
                    <dd className="font-semibold">UGX {Number(analysis.checks.expected_ugx || 0).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Received</dt>
                    <dd className="font-semibold">UGX {Number(analysis.checks.received_ugx || 0).toLocaleString()}</dd>
                  </div>
                  {analysis.checks.amount === 'partial' ? (
                    <div className="col-span-2">
                      <dt className="text-slate-400">Remaining</dt>
                      <dd className="font-semibold text-amber-200">
                        UGX {Number(analysis.checks.balance_ugx || 0).toLocaleString()}
                      </dd>
                    </div>
                  ) : null}
                  {analysis.checks.amount === 'over' ? (
                    <div className="col-span-2">
                      <dt className="text-slate-400">Excess</dt>
                      <dd className="font-semibold text-amber-200">
                        UGX {Number(analysis.checks.excess_ugx || 0).toLocaleString()}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </div>
          ) : null}

          {needsOverpay ? (
            <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-amber-200">
              <input
                type="checkbox"
                checked={acceptOverpay}
                onChange={(e) => setAcceptOverpay(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600"
              />
              I reviewed the overpayment excess and accept confirming this claim
            </label>
          ) : null}

          {dupLink?.claimId ? (
            <p className="mt-3 text-sm text-rose-200" role="alert">
              Duplicate reference already on{' '}
              <Link className="font-semibold underline" to={`/payments/${dupLink.claimId}`}>
                {dupLink.claimRef || `claim #${dupLink.claimId}`}
              </Link>
            </p>
          ) : null}

          {needsForce ? (
            <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-amber-200">
              <input
                type="checkbox"
                checked={forceConfirm}
                onChange={(e) => setForceConfirm(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600"
              />
              I reviewed competing claims and still want to confirm this one
            </label>
          ) : null}
        </section>
      </div>

      {!closed ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-800 bg-bg-900/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={confirm}
              disabled={confirming || (needsOverpay && !acceptOverpay)}
              className="min-h-11 flex-1 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue px-4 text-sm font-semibold text-white shadow-neon-lg disabled:opacity-60 sm:flex-none sm:min-w-[12rem]"
            >
              {confirming ? 'Confirming…' : 'Confirm payment'}
            </button>
            <button
              type="button"
              onClick={saveUnmatched}
              disabled={confirming}
              className="min-h-11 rounded-lg border border-amber-500/40 px-4 text-sm font-semibold text-amber-100 hover:bg-amber-500/10"
            >
              Save as unmatched
            </button>
            <button
              type="button"
              onClick={markAmbiguous}
              className="min-h-11 rounded-lg border border-gray-600 px-4 text-sm font-semibold text-slate-200 hover:bg-gray-800"
            >
              Mark ambiguous
            </button>
            <button
              type="button"
              onClick={() => reject('not_found')}
              className="min-h-11 rounded-lg border border-gray-600 px-4 text-sm font-semibold text-slate-200 hover:bg-gray-800"
            >
              Not found
            </button>
            <button
              type="button"
              onClick={() => reject('rejected')}
              className="min-h-11 rounded-lg border border-rose-500/40 px-4 text-sm font-semibold text-rose-200 hover:bg-rose-500/10"
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
