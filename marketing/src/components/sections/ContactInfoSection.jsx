import { siteConfig } from '../../site.config'
import { Section, SectionHeading } from '../site/Section'
import { SurfaceCard } from '../site/ui'
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'

export default function ContactInfoSection() {
  return (
    <Section id="contact" className="scroll-mt-24 py-16 md:py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Let's talk about your project"
        intro="Reach us by email, phone, or WhatsApp. We typically reply within one working day."
        align="center"
        className="mx-auto"
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <SurfaceCard className="col-span-2 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-deep/10 text-emerald-deep ring-1 ring-emerald/15">
              <FaMapMarkerAlt aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-emerald-deep">Address</h3>
            <p className="mt-2 text-sm text-ink-soft">{siteConfig.location}</p>
            {siteConfig.addressNote ? <p className="mt-1 text-xs text-ink-soft/80">{siteConfig.addressNote}</p> : null}
          </SurfaceCard>

          <SurfaceCard className="text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-deep/10 text-emerald-deep ring-1 ring-emerald/15">
              <FaEnvelope aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-emerald-deep">Email us</h3>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-2 inline-block text-sm font-semibold text-ink hover:text-emerald"
            >
              {siteConfig.email}
            </a>
          </SurfaceCard>

          <SurfaceCard className="text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-deep/10 text-emerald-deep ring-1 ring-emerald/15">
              <FaPhoneAlt aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-emerald-deep">Let&apos;s talk</h3>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold">
              {siteConfig.phones.slice(0, 2).map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="text-ink hover:text-emerald">
                  {phone}
                </a>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard>
          <p className="text-sm leading-relaxed text-ink-soft">
            Prefer WhatsApp? Use the floating button or message us directly.
          </p>
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
          >
            Chat on WhatsApp
          </a>

          <div className="mt-6 border-t border-cream-deep pt-5">
            <p className="text-sm font-semibold text-emerald-deep">Quick links</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: 'Services', href: '#services' },
                { label: 'Portfolio', href: siteConfig.links.portfolio },
                { label: 'About', href: siteConfig.links.about },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full border border-cream-deep bg-cream px-4 py-2 text-xs font-semibold text-ink-soft hover:border-emerald/40 hover:text-emerald-deep"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </Section>
  )
}
