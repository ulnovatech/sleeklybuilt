import { FiArrowRight } from 'react-icons/fi'
import PageHeader from '../components/site/PageHeader'
import ActionLink from '../components/site/ActionLink'
import { Section, SectionHeading } from '../components/site/Section'
import { SurfaceCard } from '../components/site/ui'
import { productEntries } from '../config/searchIndex'
import { siteConfig } from '../site.config'
import { usePageTitle } from '../lib/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <>
      <PageHeader
        eyebrow="404"
        title="That page has moved or never existed"
        intro="Here is where everything lives now."
        actions={
          <ActionLink href={siteConfig.links.home}>
            Back to home
            <FiArrowRight aria-hidden="true" />
          </ActionLink>
        }
      />

      <Section className="section-light">
        <SectionHeading eyebrow="What we build" title="Pick up where you left off" />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {productEntries.map((entry) => (
            <SurfaceCard key={entry.id} interactive as="article">
              <a
                href={entry.href}
                className="group flex items-start justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos focus-visible:ring-offset-2"
              >
                <span>
                  <span className="display-card block text-emerald-deep">{entry.label}</span>
                  <span className="mt-2 block text-body text-ink-soft">{entry.description}</span>
                </span>
                <FiArrowRight
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-cream-deep transition-transform group-hover:translate-x-1 group-hover:text-gold"
                />
              </a>
            </SurfaceCard>
          ))}
        </div>
      </Section>
    </>
  )
}
