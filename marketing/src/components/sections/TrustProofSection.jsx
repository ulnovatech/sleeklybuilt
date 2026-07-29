import { FiArrowRight } from 'react-icons/fi'
import { proofHighlights, trustCommitments, trustPrinciples } from '../../config/proof'
import { Section, SectionHeading } from '../site/Section'
import { SurfaceCard } from '../site/ui'

function TrustStrip() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-cream-deep bg-cream-deep sm:grid-cols-2 lg:grid-cols-4">
      {trustCommitments.map((item) => (
        <div key={item.title} className="bg-cream p-6 sm:p-7">
          <h3 className="text-sm font-semibold text-emerald-deep">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
        </div>
      ))}
    </div>
  )
}

function ProofHighlightCard({ item }) {
  return (
    <SurfaceCard interactive as="article" className="flex h-full flex-col overflow-hidden p-0">
      <div className="aspect-[16/10] overflow-hidden bg-cream-deep">
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="eyebrow text-emerald">{item.sector}</p>
        <h3 className="serif mt-3 text-xl text-emerald-deep">{item.headline}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>
        <a
          href={item.href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-deep transition hover:text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
        >
          {item.cta}
          <FiArrowRight aria-hidden="true" />
        </a>
      </div>
    </SurfaceCard>
  )
}

export default function TrustProofSection() {
  return (
    <>
      <Section className="scroll-mt-24 py-16 md:py-24" id="trust">
        <SectionHeading
          eyebrow="Why teams choose us"
          title={
            <>
              Proof you can <em className="italic text-emerald">point at</em>
            </>
          }
          intro="Real deliverables, clear communication, and support that does not disappear after launch."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12">
          <TrustStrip />
        </div>
      </Section>

      <Section className="pb-16 md:pb-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Selected work"
            title="Explore what we build"
            intro="Start with our portfolio gallery or tell us what you need custom-built."
          />
          <a
            href="/portfolio-app/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-deep hover:text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
          >
            Full portfolio
            <FiArrowRight aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {proofHighlights.map((item) => (
            <ProofHighlightCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section className="border-t border-cream-deep bg-white py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <SectionHeading
            eyebrow="What you can expect"
            title={
              <>
                The kind of partner we try <em className="italic text-emerald">to be.</em>
              </>
            }
          />
          <dl className="space-y-8">
            {trustPrinciples.map((item) => (
              <div key={item.question} className="border-t border-cream-deep pt-8 first:border-t-0 first:pt-0">
                <dt className="serif text-xl text-emerald-deep sm:text-2xl">{item.question}</dt>
                <dd className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  )
}
