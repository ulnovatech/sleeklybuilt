import { siteConfig } from '../../site.config'
import StarsBackground from './StarsBackground'

export default function PortfolioBannerSection() {
  return (
    <section className="bg-cream py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl bg-emerald-deep shadow-[0_0_24px_rgba(45,83,70,0.25)]"
          role="region"
          aria-label="Portfolio banner section"
        >
          <StarsBackground />

          <div className="relative z-10 grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-gold">Portfolio</p>
              <h2 className="serif mt-4 text-3xl text-cream sm:text-4xl">See what we&apos;ve built</h2>
              <p className="mt-3 text-base text-cream/75">Real projects for businesses across Uganda and beyond.</p>
              <a
                href={siteConfig.links.portfolio}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-deep"
              >
                View past projects
              </a>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                className="w-[520px] max-w-full select-none"
                src="/assets/img/laptop-trs.png"
                alt="Laptop showing a SleeklyBuilt project"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

