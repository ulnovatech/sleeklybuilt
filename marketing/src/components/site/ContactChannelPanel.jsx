import { FiMail, FiPhone, FiMessageCircle } from 'react-icons/fi'
import { siteConfig } from '../../site.config'

/**
 * Contact channels — ordered by speed (contact pattern).
 * Shown before the form on mobile; in the rail on desktop.
 */
const channels = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    detail: siteConfig.whatsapp.replace('https://wa.me/', '+'),
    href: siteConfig.whatsapp,
    external: true,
    icon: FiMessageCircle,
    response: 'Usually same day during business hours',
    bestFor: 'Quick questions and sending files',
  },
  {
    id: 'phone',
    label: 'Call',
    detail: siteConfig.phones[0],
    href: `tel:${siteConfig.primaryPhone}`,
    external: false,
    icon: FiPhone,
    response: 'Mon–Fri 09:00–17:00 EAT',
    bestFor: 'Urgent conversations',
  },
  {
    id: 'email',
    label: 'Email',
    detail: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    external: false,
    icon: FiMail,
    response: 'Reply within one working day',
    bestFor: 'Detailed briefs and documents',
  },
]

export default function ContactChannelPanel({ className = '' }) {
  return (
    <div className={className}>
      <p className="eyebrow">Faster options</p>
      <h2 className="mt-3 display-card text-emerald-deep">Reach us directly</h2>
      <p className="mt-2 text-body text-ink-soft">
        Pick the channel that matches how soon you need a reply. Form submissions get a reference code.
      </p>

      <ul className="mt-8 space-y-3">
        {channels.map(({ id, label, detail, href, external, icon: Icon, response, bestFor }) => (
          <li key={id}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="flex min-h-14 items-start gap-4 rounded-2xl border border-cream-deep bg-surface-raised p-4 transition duration-fast ease-dos hover:border-emerald/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
            >
              <span
                className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-deep/10 text-emerald-deep"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-meta font-semibold text-emerald-deep">{label}</span>
                <span className="mt-0.5 block truncate text-body font-medium text-ink">{detail}</span>
                <span className="mt-1 block text-sm text-ink-soft">{response}</span>
                <span className="mt-0.5 block text-sm text-content-muted">Best for: {bestFor}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-content-muted">
        Based in {siteConfig.location}
        {siteConfig.addressNote ? ` · ${siteConfig.addressNote}` : ''}.
      </p>
    </div>
  )
}
