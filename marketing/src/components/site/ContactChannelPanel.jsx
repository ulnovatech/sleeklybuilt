import { FiMail, FiPhone, FiMessageCircle } from 'react-icons/fi'
import { useSiteConfig } from '../../context/SiteContactContext'

/**
 * Compact channel escape hatch — speed over essays.
 */
export default function ContactChannelPanel({ className = '' }) {
  const siteConfig = useSiteConfig()
  const channels = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      detail: siteConfig.whatsapp.replace('https://wa.me/', '+'),
      href: siteConfig.whatsapp,
      external: true,
      icon: FiMessageCircle,
    },
    {
      id: 'phone',
      label: 'Call',
      detail: siteConfig.phones[0],
      href: `tel:${siteConfig.primaryPhone}`,
      external: false,
      icon: FiPhone,
    },
    {
      id: 'email',
      label: 'Email',
      detail: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      external: false,
      icon: FiMail,
    },
  ]

  return (
    <aside className={className}>
      <p className="eyebrow">Or reach us directly</p>
      <ul className="mt-4 space-y-2">
        {channels.map(({ id, label, detail, href, external, icon: Icon }) => (
          <li key={id}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-subtle bg-surface-raised px-3.5 py-2.5 transition hover:border-action-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              <Icon className="h-4 w-4 shrink-0 text-emerald" aria-hidden="true" />
              <span className="text-meta text-content-muted">{label}</span>
              <span className="ml-auto truncate text-meta font-medium text-ink">{detail}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-content-muted">
        {siteConfig.location}
        {siteConfig.addressNote ? ` · ${siteConfig.addressNote}` : ''}
      </p>
    </aside>
  )
}
