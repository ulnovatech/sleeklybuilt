import { FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi'
import { Eyebrow } from '../site/Section'
import GamifiedContactForm from '../forms/GamifiedContactForm'
import { useSiteConfig } from '../../context/SiteContactContext'

/**
 * Home closing contact band — mid-journey obsidian (hero + this + footer).
 * Mobile: context first, then form; channels as escape hatch.
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
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <Eyebrow tone="invert">Let&apos;s talk</Eyebrow>
            <h2 className="display-section mt-5 text-cream">Have a project in mind?</h2>
            <p className="lead mt-4 text-cream/70 md:mt-5">
              Tell us what you&apos;re looking for. We&apos;ll reply within one working day.
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <GamifiedContactForm />
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
            <p className="eyebrow-invert">Or reach us directly</p>
            <ul className="mt-5 space-y-px overflow-hidden rounded-dos-xl border border-obsidian-line bg-obsidian-line">
              {channels.map(({ id, icon: Icon, label, value, href }) => (
                <li key={id}>
                  <a
                    href={href}
                    target={id === 'whatsapp' ? '_blank' : undefined}
                    rel={id === 'whatsapp' ? 'noreferrer' : undefined}
                    className="group flex min-h-11 items-center gap-4 bg-obsidian-raised px-5 py-3.5 transition duration-fast ease-dos hover:bg-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dos-inverse"
                  >
                    <Icon aria-hidden="true" className="shrink-0 text-accent" />
                    <span className="text-meta text-cream/50">{label}</span>
                    <span className="ml-auto text-meta font-medium text-cream transition duration-fast ease-dos group-hover:text-accent">
                      {value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
