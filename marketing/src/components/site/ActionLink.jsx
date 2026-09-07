import { ActionLink as FoundationActionLink } from '@sleeklybuilt/design-foundation/react'
import NavLink from '../layout/NavLink'

/**
 * Marketing CTA link — foundation ActionLink wired to hub NavLink
 * (internal router vs portfolio SPA / absolute URLs).
 */
export default function ActionLink({ href, variant = 'gold', className = '', children, ...rest }) {
  return (
    <FoundationActionLink
      href={href}
      variant={variant}
      className={className}
      LinkComponent={({ href: to, className: cls, children: label, ...linkRest }) => (
        <NavLink item={{ href: to }} className={cls} {...linkRest}>
          {label}
        </NavLink>
      )}
      {...rest}
    >
      {children}
    </FoundationActionLink>
  )
}
