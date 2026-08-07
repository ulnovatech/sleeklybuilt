import NavLink from '../layout/NavLink'
import { cn } from '../../lib/utils'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 py-3.5 text-meta font-semibold transition duration-fast ease-dos focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const actionVariants = {
  /** Primary on obsidian */
  gold: 'bg-accent text-content-primary hover:bg-accent-hover focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian',
  /** Secondary on obsidian */
  ghostDark:
    'border border-cream/25 text-content-inverse hover:bg-cream/10 focus-visible:ring-dos-inverse focus-visible:ring-offset-obsidian',
  /** Primary on cream */
  emerald:
    'bg-action-primary-hover text-content-inverse hover:bg-action-primary active:bg-action-primary-active focus-visible:ring-dos focus-visible:ring-offset-surface-base',
  /** Secondary on cream */
  ghostLight:
    'border border-subtle text-action-primary-hover hover:border-action-primary/40 hover:bg-action-secondary-hover focus-visible:ring-dos focus-visible:ring-offset-surface-base',
}

/**
 * Call-to-action link. Routing (internal vs. separate app) is delegated to
 * NavLink so every CTA on the site resolves the same way.
 * Focus uses ring-dos / ring-dos-inverse — never gold or emerald as the ring.
 */
export default function ActionLink({ href, variant = 'gold', className = '', children, ...rest }) {
  return (
    <NavLink item={{ href }} className={cn(base, actionVariants[variant], className)} {...rest}>
      {children}
    </NavLink>
  )
}
