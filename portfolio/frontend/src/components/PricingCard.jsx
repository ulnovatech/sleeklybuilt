import { Link } from 'react-router-dom'

export default function PricingCard({ title, price, features, popular = false }) {
  return (
    <div
      className={`relative rounded-xl border bg-surface-raised p-8 shadow-sm transition duration-fast ease-dos ${
        popular
          ? 'scale-[1.02] border-action-primary/40 ring-2 ring-action-primary/20'
          : 'border-subtle hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      {popular ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-action-primary-hover px-4 py-1 text-sm font-semibold text-content-inverse">
            Most Popular
          </span>
        </div>
      ) : null}

      <div className="text-center">
        <h3 className="font-display text-2xl font-semibold text-emerald-deep mb-4">{title}</h3>
        <div className="text-3xl font-bold tabular-nums text-action-primary mb-1">{price}</div>
        <div className="text-content-muted mb-8">Negotiable</div>

        <ul className="mb-8 space-y-3 text-left">
          {features.map((feature) => (
            <li key={feature} className="flex items-center text-content-secondary">
              <span className="mr-3 h-1.5 w-1.5 shrink-0 rounded-full bg-action-soft" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <Link
            to="/order"
            className={`flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos ${
              popular
                ? 'bg-action-primary-hover text-content-inverse hover:bg-action-primary'
                : 'bg-surface-sunken text-emerald-deep hover:bg-action-secondary-hover'
            }`}
          >
            View details
          </Link>
          <Link
            to="/order"
            className={`flex min-h-11 w-full items-center justify-center rounded-full border px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos ${
              popular
                ? 'border-action-primary text-action-primary-hover hover:bg-action-secondary-hover'
                : 'border-transparent bg-accent text-content-primary hover:bg-accent-hover'
            }`}
          >
            Choose plan
          </Link>
        </div>
      </div>
    </div>
  )
}
