import CountrySelect, { defaultDialCode } from './CountrySelect'
import { cn } from '../../lib/utils'

/**
 * Compact phone control — dial + national number as one answer unit.
 */
export default function PhoneInput({
  dialCode,
  onDialCodeChange,
  phone,
  onPhoneChange,
  onBlur,
  onKeyDown,
  required = true,
  phoneId = 'contact-phone',
  dialId = 'contact-dial',
  describedBy,
  invalid = false,
  inputRef,
  className = '',
  compact = false,
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className={compact ? 'w-[7.5rem] shrink-0' : 'w-36 shrink-0'}>
        {!compact ? (
          <label htmlFor={dialId} className="block text-meta font-semibold text-emerald-deep">
            Code
          </label>
        ) : (
          <label htmlFor={dialId} className="sr-only">
            Country code
          </label>
        )}
        <CountrySelect
          id={dialId}
          value={dialCode || defaultDialCode}
          onChange={onDialCodeChange}
          className={cn(
            'field-input',
            !compact && 'mt-2',
            invalid && 'field-input-error',
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        {!compact ? (
          <>
            <label htmlFor={phoneId} className="block text-meta font-semibold text-emerald-deep">
              Phone{required ? '' : ' (optional)'}
            </label>
            <p id={`${phoneId}-hint`} className="field-hint">
              Without the country code.
            </p>
          </>
        ) : (
          <label htmlFor={phoneId} className="sr-only">
            Phone number
          </label>
        )}
        <input
          id={phoneId}
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={
            compact
              ? describedBy
              : [`${phoneId}-hint`, describedBy].filter(Boolean).join(' ') || undefined
          }
          placeholder="772 169 960"
          className={cn('field-input', !compact && 'mt-2', invalid && 'field-input-error')}
        />
      </div>
    </div>
  )
}
