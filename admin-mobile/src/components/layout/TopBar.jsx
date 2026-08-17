import { SITE } from '../../site.config'

export default function TopBar({ title, subtitle, leading }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-surface/90 px-4 pb-4 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-start gap-2">
        {leading ? <div className="shrink-0 pt-1">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            {SITE.name}
          </p>
          <h1 className="mt-1 text-xl font-bold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  )
}
