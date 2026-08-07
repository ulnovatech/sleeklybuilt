import CountrySelect, { defaultDialCode } from './CountrySelect'
import { cn } from '../../lib/utils'

/**
 * Phone field with persistent labels (forms system — placeholders are not labels).
 */
export default function PhoneInput({
  dialCode,
  onDialCodeChange,
  phone,
  onPhoneChange,
  onBlur,
  required = true,
  phoneId = 'contact-phone',
  dialId = 'contact-dial',
  describedBy,
  invalid = false,
  inputRef,
  className = '',
}) {
  const inputClass =
    'min-h-11 rounded-xl border bg-surface-base px-3 py-2.5 text-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos'

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end', className)}>
      <div className="sm:w-40 sm:shrink-0">
        <label htmlFor={dialId} className="block text-meta font-semibold text-emerald-deep">
          Country code
        </label>
        <CountrySelect
          id={dialId}
          value={dialCode || defaultDialCode}
          onChange={onDialCodeChange}
          className={cn(
            inputClass,
            'mt-2 w-full',
            invalid ? 'border-status-danger/40' : 'border-cream-deep',
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor={phoneId} className="block text-meta font-semibold text-emerald-deep">
          Phone number{required ? '' : ' (optional)'}
        </label>
        <p id={`${phoneId}-hint`} className="mt-1 text-sm text-content-muted">
          Include the number without the country code.
        </p>
        <input
          id={phoneId}
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={[`${phoneId}-hint`, describedBy].filter(Boolean).join(' ') || undefined}
          placeholder="772169960"
          className={cn(
            inputClass,
            'mt-2 w-full',
            invalid ? 'border-status-danger/40' : 'border-cream-deep focus:border-emerald/40',
          )}
        />
      </div>
    </div>
  )
}
