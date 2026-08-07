import { Link } from 'react-router-dom'
import { isExternalHref } from '../../lib/utils'

/**
 * Navigation link. Internal routes go through the router; the portfolio SPA and
 * absolute URLs are full page loads because they are separate applications.
 */
export default function NavLink({ item, onNavigate, className = '', children, ...rest }) {
  const label = children ?? item.label

  if (!item.href) {
    return (
      <span className={className} {...rest}>
        {label}
      </span>
    )
  }

  if (isExternalHref(item.href)) {
    const external = item.href.startsWith('http')

    return (
      <a
        href={item.href}
        className={className}
        onClick={onNavigate}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {label}
      </a>
    )
  }

  return (
    <Link to={item.href} className={className} onClick={onNavigate} {...rest}>
      {label}
    </Link>
  )
}
