/**
 * Settings → Payments — MTN / Airtel merchant config
 * UX-GATE C6 · MERCHANT_CODES.md
 */

import { useEffect, useState } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SettingsAPI } from '../services/api'

const EMPTY = {
  mtn: {
    provider: 'mtn',
    display_name: 'MTN Mobile Money',
    merchant_identifier: '',
    is_active: true,
    display_order: 1,
    payment_instructions: '',
    ussd_instruction: '',
  },
  airtel: {
    provider: 'airtel',
    display_name: 'Airtel Money',
    merchant_identifier: '',
    is_active: true,
    display_order: 2,
    payment_instructions: '',
    ussd_instruction: '',
  },
}

function fieldClass(hasError) {
  return `mt-1 w-full rounded-lg border bg-bg-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/60 ${
    hasError ? 'border-rose-500/60' : 'border-gray-700'
  }`
}

function mapProviders(list) {
  const next = {
    mtn: { ...EMPTY.mtn },
    airtel: { ...EMPTY.airtel },
  }
  for (const row of list || []) {
    const key = String(row.provider || '').toLowerCase()
    if (key !== 'mtn' && key !== 'airtel') continue
    next[key] = {
      provider: key,
      display_name: row.display_name || next[key].display_name,
      merchant_identifier: row.merchant_identifier || '',
      is_active: Boolean(row.is_active),
      display_order: Number(row.display_order) || next[key].display_order,
      payment_instructions: row.payment_instructions || '',
      ussd_instruction: row.ussd_instruction || '',
    }
  }
  return next
}

export default function PaymentsSettingsPanel({ canEdit = true }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await SettingsAPI.getPayments()
      setForm(mapProviders(data?.providers))
    } catch (err) {
      setLoadError(err?.message || 'Could not load payment settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const update = (provider, key, value) => {
    setSuccess('')
    setSaveError('')
    setForm((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], [key]: value },
    }))
  }

  const onSave = async (e) => {
    e.preventDefault()
    if (!canEdit) return
    setSaving(true)
    setSaveError('')
    setSuccess('')
    setFieldErrors({})
    try {
      const payload = {
        providers: [form.mtn, form.airtel],
      }
      const data = await SettingsAPI.updatePayments(payload)
      setForm(mapProviders(data?.providers))
      setSuccess('Payment settings saved. New checkouts use these codes; history is unchanged.')
    } catch (err) {
      const details = err?.body?.details
      if (details && typeof details === 'object') {
        setFieldErrors(details)
      }
      setSaveError(err?.message || 'Could not save payment settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-gray-800 bg-bg-850/40 p-4 sm:p-5" aria-labelledby="payments-settings-heading">
      <div className="mb-4">
        <h2 id="payments-settings-heading" className="text-lg font-semibold text-white">
          Payments
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          MTN and Airtel merchant codes shown at checkout. Changing codes does not alter past payments.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading payment settings">
          <div className="h-32 rounded-xl bg-gray-800/60" />
          <div className="h-32 rounded-xl bg-gray-800/60" />
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert">
          <p className="flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              {loadError}{' '}
              <span className="text-rose-300/80">
                If the table is missing, run{' '}
                <code className="text-xs">apply_payment_provider_config_migration.php</code>.
              </span>
            </span>
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-11 rounded-lg border border-rose-400/40 px-4 text-sm font-semibold text-rose-100 hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <form onSubmit={onSave} className="space-y-6">
          {['mtn', 'airtel'].map((key) => {
            const row = form[key]
            const label = key === 'mtn' ? 'Merchant code' : 'Merchant number'
            return (
              <div key={key} className="rounded-xl border border-gray-800 bg-bg-900/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-100">{row.display_name}</h3>
                  <label className="flex min-h-11 items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={row.is_active}
                      disabled={!canEdit}
                      onChange={(e) => update(key, 'is_active', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 bg-bg-900 text-accent-purple focus:ring-accent-purple/60"
                    />
                    Active at checkout
                  </label>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`pay-${key}-id`} className="block text-sm font-medium text-slate-200">
                      {label}
                    </label>
                    <input
                      id={`pay-${key}-id`}
                      className={fieldClass(!!fieldErrors[`providers.${key}.merchant_identifier`])}
                      value={row.merchant_identifier}
                      disabled={!canEdit}
                      onChange={(e) => update(key, 'merchant_identifier', e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor={`pay-${key}-ussd`} className="block text-sm font-medium text-slate-200">
                      USSD / tip line
                    </label>
                    <input
                      id={`pay-${key}-ussd`}
                      className={fieldClass(false)}
                      value={row.ussd_instruction}
                      disabled={!canEdit}
                      onChange={(e) => update(key, 'ussd_instruction', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor={`pay-${key}-instructions`} className="block text-sm font-medium text-slate-200">
                    Payment instructions
                  </label>
                  <textarea
                    id={`pay-${key}-instructions`}
                    rows={3}
                    className={fieldClass(false)}
                    value={row.payment_instructions}
                    disabled={!canEdit}
                    onChange={(e) => update(key, 'payment_instructions', e.target.value)}
                  />
                </div>
              </div>
            )
          })}

          {canEdit ? (
            <div className="sticky bottom-0 z-10 border-t border-gray-800 bg-bg-900/95 py-3 backdrop-blur">
              {success ? (
                <p className="mb-2 flex items-center gap-2 text-sm text-emerald-300" role="status">
                  <CheckCircleIcon className="h-5 w-5 shrink-0" />
                  {success}
                </p>
              ) : null}
              {saveError ? (
                <p className="mb-2 text-sm text-rose-300" role="alert">
                  {saveError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 w-full rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue px-4 text-sm font-semibold text-white shadow-neon-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[10rem]"
              >
                {saving ? 'Saving…' : 'Save payment settings'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Only admins can change payment settings.</p>
          )}
        </form>
      ) : null}
    </section>
  )
}
