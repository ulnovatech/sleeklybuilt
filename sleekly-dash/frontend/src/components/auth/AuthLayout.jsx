/**
 * Design OS: patterns/authentication_flow.md + systems/forms_system.md
 *
 * Shared chrome for sign-in / sign-up / forgot / reset.
 * One AuthCard structure; step content changes, layout does not.
 */

import { Link } from 'react-router-dom'
import { siteConfig } from '../../site.config'

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="min-h-screen bg-[#0b1220] px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">{siteConfig.name}</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-2xl sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
          </header>
          {children}
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-slate-400">{footer}</div> : null}

        <p className="mt-8 text-center text-xs text-slate-600">
          <Link to="/login" className="hover:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            {siteConfig.tagline}
          </Link>
        </p>
      </div>
    </div>
  )
}

export function AuthError({ children }) {
  if (!children) return null
  return (
    <div
      className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
      role="alert"
      tabIndex={-1}
      id="auth-form-error"
    >
      {children}
    </div>
  )
}

export function AuthSuccess({ children }) {
  if (!children) return null
  return (
    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" role="status">
      {children}
    </div>
  )
}

export function authFieldClass(hasError) {
  return `w-full rounded-lg border bg-[#0b1220] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand ${
    hasError ? 'border-rose-500/60' : 'border-gray-700'
  }`
}
