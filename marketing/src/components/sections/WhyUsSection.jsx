import { FaUsers, FaClock, FaCoins, FaAward } from 'react-icons/fa'
import { Section, SectionHeading } from '../site/Section'
import { SurfaceCard } from '../site/ui'

const cards = [
  {
    icon: FaUsers,
    title: 'Expert & Professional Team',
    description:
      "We're a team of skilled people who love what we do. You can count on us to handle your project with care and creativity.",
  },
  {
    icon: FaClock,
    title: 'Quick Delivery',
    description: "We work fast without cutting corners. Your order gets to you on time so you don't have to wait around.",
  },
  {
    icon: FaCoins,
    title: 'Affordable Price',
    description: "Good quality doesn't always mean expensive. We keep our prices fair so you get real value for your money.",
  },
  {
    icon: FaAward,
    title: 'Satisfaction Guarantee',
    description: "We want you to be happy with our work. If something isn't right, we'll fix it until you're satisfied.",
  },
]

export default function WhyUsSection() {
  return (
    <Section id="why" className="scroll-mt-24 py-16 md:py-24">
      <SectionHeading
        eyebrow="Why choose us"
        title="Built around your needs — not ours"
        intro="We're here to make things easier for you. Our services are designed so you can get started without stress and scale with confidence."
        align="center"
        className="mx-auto"
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {cards.map(({ icon: Icon, title, description }) => (
          <SurfaceCard key={title} interactive as="article">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-deep text-cream">
                <Icon className="text-lg" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-deep">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </Section>
  )
}
