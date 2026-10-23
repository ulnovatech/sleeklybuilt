/**
 * Authentic SleeklyBuilt attendant panel (live capture) in a browser frame.
 * Labelled illustration — not an interactive session on this surface.
 */
export default function AttendantHeroVisual() {
  return (
    <figure className="relative" aria-label="Screenshot of the SleeklyBuilt attendant chat panel">
      <div className="overflow-hidden rounded-dos-xl border border-cream/15 bg-obsidian-raised shadow-md">
        <div className="flex items-center gap-2 border-b border-cream/10 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-cream/25" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-cream/25" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-cream/25" aria-hidden="true" />
          <span className="ml-2 truncate font-sans text-meta text-cream/45">sleeklybuilt.pro</span>
        </div>
        <div className="bg-obsidian p-3 sm:p-4">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="/assets/attendant/panel-desktop.webp"
              type="image/webp"
            />
            <img
              src="/assets/attendant/panel-mobile.webp"
              alt="SleeklyBuilt attendant panel open on the homepage, ready for a visitor question"
              width={780}
              height={366}
              className="mx-auto h-auto w-full max-w-md rounded-dos-lg border border-cream/10 object-cover object-top md:max-w-none md:object-contain"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
      </div>
      <figcaption className="mt-3 text-meta text-cream/55">
        Real attendant panel — illustration on this page, not a live chat session
      </figcaption>
    </figure>
  )
}
