export default function ContactCtaBand({
  title = 'Have a project in mind?',
  body = "Tell us what you're trying to improve. We'll reply within one working day.",
  ctaHref = '/#contact',
  ctaLabel = 'Start a conversation',
}) {
  return (
    <section className="py-16 md:py-20" aria-labelledby="contact-cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl bg-emerald-deep px-8 py-14 text-cream md:px-14 md:py-20">
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid items-end gap-10 md:grid-cols-[1.4fr_auto]">
            <div>
              <div className="eyebrow mb-5 text-gold">Let&apos;s talk</div>
              <h2 id="contact-cta-heading" className="serif max-w-2xl text-3xl leading-[1.05] md:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">{body}</p>
            </div>
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full bg-cream px-7 py-4 text-sm font-semibold text-emerald-deep transition-colors hover:bg-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-deep"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
