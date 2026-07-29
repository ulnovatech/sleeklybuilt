import { FaBroadcastTower, FaChalkboardTeacher, FaCogs, FaArrowRight } from 'react-icons/fa'
import { Section, SectionHeading } from '../site/Section'
import { SurfaceCard } from '../site/ui'

export default function ServicesSection({ onOpenInquiry }) {
  const cards = [
    {
      id: 'software',
      image: '/assets/img/services-1.jpg',
      icon: FaCogs,
      title: 'Custom Software Development',
      description:
        'We build powerful backend systems, automation tools, and business platforms to perfectly fit your workflow.',
      href: '/#services',
      inquiryId: null,
    },
    {
      id: 'webapp',
      image: '/assets/img/services-2.jpg',
      icon: FaBroadcastTower,
      title: 'Web & Mobile App Development',
      description:
        'From sleek websites to scalable mobile apps — we design, develop, and deploy full-stack digital solutions.',
      href: '/#webdesign',
      inquiryId: 'app',
    },
    {
      id: 'it',
      image: '/assets/img/services.jpg',
      icon: FaChalkboardTeacher,
      title: 'IT Services & Technical Support',
      description:
        'Infrastructure setup, network installations, tech consulting, and reliable support to keep your systems running smoothly.',
      href: '/#services',
      inquiryId: null,
    },
  ]

  return (
    <Section id="services" className="scroll-mt-24 py-16 md:py-24">
      <SectionHeading
        eyebrow="What we do"
        title={
          <>
            Services built to <em className="italic text-emerald">last</em>
          </>
        }
        intro="Whether it's a product idea, an app for your team, or the front door to your business — we focus on clarity, reliability, and long-term value."
        align="center"
        className="mx-auto"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <SurfaceCard key={card.id} interactive as="article" className="overflow-hidden p-0">
              <div className="group relative aspect-[16/10] overflow-hidden bg-cream-deep">
                <img
                  src={card.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="relative p-6">
                <div className="-mt-12 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-deep text-cream shadow-sm ring-1 ring-black/5">
                  <Icon aria-hidden="true" />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <a href={card.href} className="text-lg font-semibold text-emerald-deep hover:text-emerald">
                    {card.title}
                  </a>
                  <FaArrowRight
                    className="mt-1 shrink-0 text-cream-deep transition group-hover:text-emerald"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{card.description}</p>

                {card.inquiryId && typeof onOpenInquiry === 'function' ? (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => onOpenInquiry(card.inquiryId)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-deep hover:text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                    >
                      Request a quote <span aria-hidden="true">→</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </SurfaceCard>
          )
        })}
      </div>
    </Section>
  )
}
