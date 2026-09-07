import { useEffect, useRef } from 'react'
import { FiArrowUpRight, FiExternalLink } from 'react-icons/fi'
import { performanteDestinations } from '../../config/performanteDestinations'

function isAbsoluteHttp(href) {
  return /^https?:\/\//i.test(href)
}

/**
 * Destination list — imported only after Clerk allowlist success
 * so unsigned visitors never load this module.
 */
export default function PerformanteDestinations() {
  const firstRef = useRef(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  return (
    <nav aria-label="Operator destinations" className="mt-10">
      <ul className="divide-y divide-obsidian-line border-y border-obsidian-line">
        {performanteDestinations.map((dest, index) => {
          const absolute = isAbsoluteHttp(dest.href)
          const className =
            'group flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left outline-none transition hover:bg-cream/[0.04] focus-visible:bg-cream/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold'

          return (
            <li key={dest.id}>
              <a
                ref={index === 0 ? firstRef : undefined}
                href={dest.href}
                className={className}
                {...(absolute ? { rel: 'noopener noreferrer', target: '_self' } : {})}
              >
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-cream group-hover:text-gold-soft">
                    {dest.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-cream/55">{dest.description}</span>
                </span>
                {absolute ? (
                  <FiExternalLink
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-cream/40 group-hover:text-gold"
                  />
                ) : (
                  <FiArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-cream/40 group-hover:text-gold"
                  />
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
