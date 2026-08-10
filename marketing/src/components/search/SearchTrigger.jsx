import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { cn } from '../../lib/utils'

function shortcutLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl K'
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K'
}

/**
 * Compact search affordance — icon + shortcut, no wide fake field.
 */
export default function SearchTrigger({ tone = 'light', onOpen, className = '' }) {
  const [shortcut, setShortcut] = useState('Ctrl K')
  const onDark = tone === 'hero'

  useEffect(() => {
    setShortcut(shortcutLabel())
  }, [])

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group hidden h-9 items-center gap-2 rounded-full border px-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:inline-flex',
        onDark
          ? 'border-cream/20 bg-cream/5 text-cream/70 hover:border-cream/35 hover:text-cream focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian'
          : 'border-subtle bg-surface-raised/70 text-ink-soft hover:border-emerald/30 hover:text-emerald-deep focus-visible:ring-dos focus-visible:ring-offset-surface-base',
        className,
      )}
      aria-label="Search products, pages and layouts"
    >
      <FiSearch aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only xl:not-sr-only xl:inline">Search</span>
      <kbd
        className={cn(
          'rounded border px-1.5 py-0.5 text-[0.625rem] font-sans font-medium',
          onDark ? 'border-cream/20 text-cream/55' : 'border-cream-deep text-ink-soft/70',
        )}
      >
        {shortcut}
      </kbd>
    </button>
  )
}
