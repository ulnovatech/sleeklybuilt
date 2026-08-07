import { FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi'
import { Eyebrow } from '../site/Section'
import GamifiedContactForm from '../forms/GamifiedContactForm'
import { siteConfig } from '../../site.config'

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

export default function LetsTalkSection() {
  return (
    <section id="contact" className="surface-obsidian section-dark scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Intro sits first in the DOM so mobile readers get context before the form */}
          <div className="lg:col-start-1 lg:row-start-1">
            <Eyebrow tone="invert">Let&apos;s talk</Eyebrow>
            <h2 className="display-section mt-5 text-cream">Have a project in mind?</h2>
            <p className="lead mt-5 text-cream/70">
              Tell us what you&apos;re looking for. We&apos;ll reply within one working day.
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <GamifiedContactForm />
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
            <p className="eyebrow-invert">Or reach us directly</p>
            <ul className="mt-6 space-y-px overflow-hidden rounded-2xl border border-obsidian-line bg-obsidian-line">
              {channels.map(({ id, icon: Icon, label, value, href }) => (
                <li key={id}>
                  <a
                    href={href}
                    target={id === 'whatsapp' ? '_blank' : undefined}
                    rel={id === 'whatsapp' ? 'noreferrer' : undefined}
                    className="group flex items-center gap-4 bg-obsidian-raised px-5 py-4 transition-colors hover:bg-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dos-inverse"
                  >
                    <Icon aria-hidden="true" className="shrink-0 text-gold" />
                    <span className="text-meta text-cream/50">{label}</span>
                    <span className="ml-auto text-meta font-medium text-cream transition-colors group-hover:text-gold">
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
