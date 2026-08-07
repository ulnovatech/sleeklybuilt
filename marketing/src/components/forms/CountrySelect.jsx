import { countryCodes, defaultDialCode } from '../../lib/countryCodes'
import { cn } from '../../lib/utils'

export default function CountrySelect({ value, onChange, id, className = '' }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'min-h-11 rounded-xl border border-cream-deep bg-surface-base px-2 py-2.5 text-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos',
        className,
      )}
      aria-label={id ? undefined : 'Country code'}
    >
      {countryCodes.map((c) => (
        <option key={`${c.code}-${c.dial}`} value={c.dial}>
          {c.dial} {c.name}
        </option>
      ))}
    </select>
  )
}

export { defaultDialCode }
