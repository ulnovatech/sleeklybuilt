import { FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi'
import GamifiedContactForm from '../forms/GamifiedContactForm'
import { useSiteConfig } from '../../context/SiteContactContext'

/**
 * Home contact band — form is the conversation; copy stays short.
 */
export default function LetsTalkSection() {
  const siteConfig = useSiteConfig()
  const channels = [
    {
      id: 'email',
      icon: FiMail,
      label: 'Email',
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    {
      id: 'phone',
      icon: FiPhone,
      label: 'Call',
      value: siteConfig.phones[0],
      href: `tel:${siteConfig.primaryPhone}`,
    },
    {
      id: 'whatsapp',
      icon: FiMessageCircle,
      label: 'WhatsApp',
      value: 'Message us',
      href: siteConfig.whatsapp,
    },
  ]

  return (
    <section id="contact" className="surface-obsidian section-dark scroll-mt-24">
      <div className="mx-auto max-w-content px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,28rem)] lg:items-start lg:justify-between lg:gap-12">
          <div>
            <p className="eyebrow-invert">Contact</p>
            <h2 className="mt-3 font-display text-display-section text-cream">Start a conversation</h2>
            <p className="mt-3 max-w-sm text-meta text-cream/65">
              One question at a time. Reply within one working day.
            </p>
            <ul className="mt-8 space-y-1">
              {channels.map(({ id, icon: Icon, label, value, href }) => (
                <li key={id}>
                  <a
                    href={href}
                    target={id === 'whatsapp' ? '_blank' : undefined}
                    rel={id === 'whatsapp' ? 'noreferrer' : undefined}
                    className="group flex min-h-10 items-center gap-3 rounded-lg px-2 py-2 text-meta transition hover:bg-cream/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                    <span className="text-cream/45">{label}</span>
                    <span className="ml-auto text-cream/85 group-hover:text-accent">{value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <GamifiedContactForm />
        </div>
      </div>
    </section>
  )
}
