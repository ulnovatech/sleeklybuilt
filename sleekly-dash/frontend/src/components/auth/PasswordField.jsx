import { useMemo, useState } from 'react'

const MIN_LEN = 12

export function passwordChecks(value) {
  const v = value || ''
  return {
    length: v.length >= MIN_LEN,
    number: /\d/.test(v),
  }
}

export function passwordIsValid(value) {
  const c = passwordChecks(value)
  return c.length && c.number
}

/**
 * Password field with show/hide and optional strength checklist (sign-up / reset).
 */
export default function PasswordField({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  autoComplete = 'current-password',
  readOnly = false,
  required = true,
  showRequirements = false,
  error = '',
}) {
  const [visible, setVisible] = useState(false)
  const checks = useMemo(() => passwordChecks(value), [value])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
        <button
          type="button"
          className="min-h-11 text-sm text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-2"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={showRequirements ? `${id}-reqs` : error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand ${
          error ? 'border-rose-500/60' : 'border-gray-700'
        } ${readOnly ? 'opacity-80' : ''}`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-300" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-1 min-h-[1rem] text-xs text-transparent" aria-hidden="true">
          .
        </p>
      )}
      {showRequirements ? (
        <ul id={`${id}-reqs`} className="mt-2 space-y-1 text-xs text-slate-400">
          <li className={checks.length ? 'text-emerald-300' : ''}>
            {checks.length ? '✓' : '○'} At least {MIN_LEN} characters
          </li>
          <li className={checks.number ? 'text-emerald-300' : ''}>
            {checks.number ? '✓' : '○'} Includes a number
          </li>
        </ul>
      ) : null}
    </div>
  )
}
