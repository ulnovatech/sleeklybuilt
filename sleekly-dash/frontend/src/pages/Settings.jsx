/**
 * Sleekly Dash — Public contact settings
 *
 * Design OS: patterns/settings.md (+ forms / empty / loading / error systems)
 *
 * User journey: Sidebar → Settings → edit Public contact → Save → confirmation
 * Primary action: Save changes
 * States: loading skeleton | form with seeded defaults | inline validation |
 *         success near Save | error with retry | disabled while saving
 */

import { useEffect, useState } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SettingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import TeamUsersPanel from '../components/TeamUsersPanel'

const EMPTY_FORM = {
  brand_name: '',
  email: '',
  location: '',
  address_note: '',
  phonesText: '',
  primary_phone: '',
  whatsapp_url: '',
  social: { x: '', instagram: '', linkedin: '', youtube: '' },
  logo_path: '',
}

function toForm(data) {
  if (!data) return { ...EMPTY_FORM }
  return {
    brand_name: data.brand_name || data.brandName || '',
    email: data.email || '',
    location: data.location || '',
    address_note: data.address_note || data.addressNote || '',
    phonesText: Array.isArray(data.phones) ? data.phones.join('\n') : '',
    primary_phone: data.primary_phone || data.primaryPhone || '',
    whatsapp_url: data.whatsapp_url || data.whatsapp || '',
    social: {
      x: data.social?.x || '',
      instagram: data.social?.instagram || '',
      linkedin: data.social?.linkedin || '',
      youtube: data.social?.youtube || '',
    },
    logo_path: data.logo_path || data.logo || '',
  }
}

function fieldClass(hasError) {
  return `mt-1 w-full rounded-lg border bg-bg-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/60 ${
    hasError ? 'border-rose-500/60' : 'border-gray-700'
  }`
}

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading settings">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-800/60" />
      ))}
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await SettingsAPI.getSiteContact()
      setForm(toForm(data))
    } catch (err) {
      setLoadError(err.message || 'Could not load contact settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess('')
    setSaveError('')
  }

  const updateSocial = (key, value) => {
    setForm((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value },
    }))
    setSuccess('')
    setSaveError('')
  }

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setFieldErrors({})
    setSuccess('')
    const phones = form.phonesText
      .split(/[\n,]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    try {
      const data = await SettingsAPI.updateSiteContact({
        brand_name: form.brand_name,
        email: form.email,
        location: form.location,
        address_note: form.address_note,
        phones,
        primary_phone: form.primary_phone,
        whatsapp_url: form.whatsapp_url,
        social: form.social,
        logo_path: form.logo_path,
      })
      setForm(toForm(data))
      setSuccess('Saved. Marketing site contact will use these values.')
    } catch (err) {
      const details = err.body?.details
      if (details && typeof details === 'object') {
        setFieldErrors(details)
      }
      setSaveError(err.message || 'Save failed. Check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-24 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update the public contact details shown on the marketing site. Changes apply without a redeploy.
        </p>
      </header>

      {loading ? <Skeleton /> : null}

      {!loading && loadError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4" role="alert">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
            <div>
              <p className="font-medium text-rose-100">Could not load settings</p>
              <p className="mt-1 text-sm text-rose-200/90">{loadError}</p>
              <p className="mt-2 text-xs text-rose-200/70">
                If this is a new install, run{' '}
                <code className="rounded bg-black/30 px-1">php sleekly-dash/backend/scripts/apply_site_contact_settings_migration.php</code>
              </p>
              <button
                type="button"
                onClick={load}
                className="mt-3 min-h-11 rounded-lg border border-rose-400/40 px-4 text-sm font-medium text-rose-100 hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <form onSubmit={onSave} className="space-y-6" noValidate>
          <section className="rounded-2xl border border-gray-800 bg-bg-800/80 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              Public contact
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Used by the marketing footer, contact panel, and WhatsApp button.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="brand_name" label="Brand name" error={fieldErrors.brand_name}>
                <input
                  id="brand_name"
                  className={fieldClass(!!fieldErrors.brand_name)}
                  value={form.brand_name}
                  onChange={(e) => update('brand_name', e.target.value)}
                  autoComplete="organization"
                  required
                />
              </Field>
              <Field id="email" label="Public email" error={fieldErrors.email}>
                <input
                  id="email"
                  type="email"
                  className={fieldClass(!!fieldErrors.email)}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>
              <Field id="location" label="Location" error={fieldErrors.location}>
                <input
                  id="location"
                  className={fieldClass(!!fieldErrors.location)}
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
              </Field>
              <Field id="address_note" label="Address note" hint="Short line under location">
                <input
                  id="address_note"
                  className={fieldClass(false)}
                  value={form.address_note}
                  onChange={(e) => update('address_note', e.target.value)}
                />
              </Field>
              <Field
                id="phones"
                label="Phone numbers"
                hint="One per line"
                error={fieldErrors.phones}
              >
                <textarea
                  id="phones"
                  rows={3}
                  className={fieldClass(!!fieldErrors.phones)}
                  value={form.phonesText}
                  onChange={(e) => update('phonesText', e.target.value)}
                />
              </Field>
              <div className="space-y-4">
                <Field id="primary_phone" label="Primary phone" hint="Digits for tel: links">
                  <input
                    id="primary_phone"
                    className={fieldClass(false)}
                    value={form.primary_phone}
                    onChange={(e) => update('primary_phone', e.target.value)}
                    inputMode="tel"
                  />
                </Field>
                <Field id="whatsapp_url" label="WhatsApp URL" error={fieldErrors.whatsapp_url}>
                  <input
                    id="whatsapp_url"
                    className={fieldClass(!!fieldErrors.whatsapp_url)}
                    value={form.whatsapp_url}
                    onChange={(e) => update('whatsapp_url', e.target.value)}
                    placeholder="https://wa.me/256…"
                  />
                </Field>
              </div>
              <Field id="logo_path" label="Logo path" hint="Public path on the hub">
                <input
                  id="logo_path"
                  className={fieldClass(false)}
                  value={form.logo_path}
                  onChange={(e) => update('logo_path', e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-800 bg-bg-800/80 p-4 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              Social links
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {['x', 'instagram', 'linkedin', 'youtube'].map((key) => (
                <Field
                  key={key}
                  id={`social_${key}`}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  error={fieldErrors[`social.${key}`]}
                >
                  <input
                    id={`social_${key}`}
                    className={fieldClass(!!fieldErrors[`social.${key}`])}
                    value={form.social[key]}
                    onChange={(e) => updateSocial(key, e.target.value)}
                    inputMode="url"
                  />
                </Field>
              ))}
            </div>
          </section>

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-800 bg-bg-900/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
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
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      ) : null}

      {!loading && !loadError && (user?.role === 'admin' || !user?.role) ? (
        <TeamUsersPanel currentUserId={user?.id} />
      ) : null}
    </div>
  )
}
