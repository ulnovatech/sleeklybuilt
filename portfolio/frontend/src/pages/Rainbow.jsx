import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { apiEndpoints, hubHref, siteConfig } from '../site.config'

const services = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Modern, responsive web interfaces that engage users',
    technologies: ['React', 'Next.js', 'TypeScript', 'Vue.js', 'Tailwind CSS'],
    features: ['Responsive Design', 'Component Libraries', 'Performance Optimization', 'Cross-browser Compatibility'],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Scalable server-side solutions with robust APIs',
    technologies: ['Node.js', 'Python', 'PHP', 'Ruby', 'Go'],
    features: ['RESTful APIs', 'Database Design', 'Authentication Systems', 'Scalable Architecture'],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Development',
    description: 'Complete solutions from database to user interface',
    technologies: ['MERN Stack', 'MEAN Stack', 'LAMP Stack', 'Django + React'],
    features: ['End-to-End Development', 'Database Integration', 'API Development', 'Deployment & Hosting'],
  },
  {
    id: 'mobile',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications',
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    features: ['iOS & Android Apps', 'Cross-Platform Solutions', 'Push Notifications', 'Offline Functionality'],
  },
  {
    id: 'uiux',
    title: 'UI/UX Design',
    description: 'User-centered design that converts visitors to customers',
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision'],
    features: ['Wireframing & Prototyping', 'User Research', 'Visual Design', 'Design Systems'],
  },
]

const fieldClass =
  'mt-2 w-full min-h-11 rounded-xl border border-subtle bg-surface-base px-4 py-3 text-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-dos'

/**
 * Custom build / quote page — soft-neutral brand mood (Wave 9 Phase E).
 * Real contactus POST preserved; no fabricated metrics or purple/blue gradients.
 */
export default function Rainbow() {
  const [activeTab, setActiveTab] = useState('frontend')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: '',
    timeline: '1-3 months',
  })

  const active = services.find((s) => s.id === activeTab) || services[0]

  const validate = () => {
    const next = {}
    if (!formData.name.trim()) next.name = 'Enter your full name.'
    if (!formData.email.trim()) next.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = 'Enter a valid email.'
    if (!formData.phone.trim()) next.phone = 'Enter your phone number.'
    if (!formData.service) next.service = 'Select a service.'
    if (!formData.message.trim()) next.message = 'Describe the project briefly.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAttempted(true)
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error('Please complete the required fields before sending.')
      return
    }

    const submissionKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    const body = new FormData()
    body.append('name', formData.name.trim())
    body.append('email', formData.email.trim())
    body.append('phone', formData.phone.trim())
    body.append('subject', `Custom development quote — ${formData.service}`)
    body.append('intent', 'project')
    body.append('submission_key', submissionKey)
    body.append(
      'message',
      [
        formData.message.trim(),
        '',
        `Company: ${formData.company.trim() || '—'}`,
        `Service: ${formData.service}`,
        `Budget: ${formData.budget || '—'}`,
        `Timeline: ${formData.timeline}`,
        'Source: portfolio /rainbow quote form',
      ].join('\n'),
    )

    setSubmitting(true)
    try {
      const response = await fetch(apiEndpoints.contact, { method: 'POST', body })
      const result = await response.json().catch(() => ({}))

      if (response.ok && result.status === 'success') {
        toast.success(
          result.reference
            ? `Received — reference ${result.reference}. We reply within one working day.`
            : 'Thank you! We will review your requirements and reply within one working day.',
        )
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          budget: '',
          message: '',
          timeline: '1-3 months',
        })
        return
      }

      toast.error(result.message || 'Could not send your request. Please try again or use the main contact form.')
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Try again, or start a project from the main site.')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToQuote = () => {
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const fieldClassFor = (id) =>
    `${fieldClass} ${errors[id] && attempted ? 'border-status-danger/40' : ''}`

  const FieldError = ({ id }) =>
    errors[id] && attempted ? (
      <p id={`rainbow-${id}-error`} className="mt-1 text-meta text-status-danger" role="alert">
        {errors[id]}
      </p>
    ) : null

  return (
    <div className="bg-surface-base py-10 md:py-14">
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <section className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Custom build</p>
          <h1 className="mt-3 font-display text-display-hero text-emerald-deep">
            Custom development for teams that need it to work
          </h1>
          <p className="mt-4 text-body text-ink-soft md:text-lead">
            Experienced engineers for frontend, backend, full-stack, mobile, and product design — from startups to
            established teams.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToQuote}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-6 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos sm:w-auto"
            >
              Request a quote
            </button>
            <Link
              to="/order"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-subtle bg-surface-raised px-6 text-meta font-semibold text-emerald-deep transition hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-dos sm:w-auto"
            >
              Start from a layout
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-display-section text-emerald-deep">Expertise</h2>
            <p className="mt-3 text-body text-ink-soft">Select an area to see typical stack and scope.</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const selected = activeTab === service.id
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveTab(service.id)}
                  className={`rounded-xl border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dos ${
                    selected
                      ? 'border-action-primary/40 bg-action-primary-hover/5 shadow-sm'
                      : 'border-subtle bg-surface-raised hover:border-action-primary/25'
                  }`}
                >
                  <h3 className="font-display text-display-card text-emerald-deep">{service.title}</h3>
                  <p className="mt-2 text-meta text-ink-soft">{service.description}</p>
                </button>
              )
            })}
          </div>

          <div className="mt-8 rounded-xl border border-subtle bg-surface-raised p-6 shadow-sm md:p-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-display-section text-emerald-deep">{active.title}</h3>
                <p className="mt-3 text-body text-ink-soft">{active.description}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-subtle bg-surface-sunken p-4">
                    <h4 className="text-meta font-semibold text-emerald-deep">Typical timeline</h4>
                    <p className="mt-1 text-meta text-ink-soft">2–8 weeks depending on complexity</p>
                  </div>
                  <div className="rounded-xl border border-subtle bg-surface-sunken p-4">
                    <h4 className="text-meta font-semibold text-emerald-deep">Starting at</h4>
                    <p className="mt-1 text-meta text-ink-soft">UGX 1,500,000</p>
                  </div>
                </div>

                <h4 className="mt-6 text-meta font-semibold text-emerald-deep">Technologies</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {active.technologies.map((tech) => (
                    <span key={tech} className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs text-ink-soft">
                      {tech}
                    </span>
                  ))}
                </div>

                <h4 className="mt-6 text-meta font-semibold text-emerald-deep">Included focus</h4>
                <ul className="mt-2 space-y-2 text-meta text-ink-soft">
                  {active.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-subtle bg-surface-sunken p-6">
                <p className="eyebrow">Ready to build?</p>
                <p className="mt-3 font-display text-display-card text-emerald-deep">
                  Tell us what you need — we reply within one working day.
                </p>
                <div className="mt-6 space-y-2 text-meta text-ink-soft">
                  <p>
                    <a
                      href={`tel:${siteConfig.primaryPhone}`}
                      className="font-semibold text-emerald hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                    >
                      {siteConfig.primaryPhone}
                    </a>
                  </p>
                  <p>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="font-semibold text-emerald hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                    >
                      {siteConfig.email}
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={scrollToQuote}
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Jump to quote form
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="quote-form" className="mt-16 scroll-mt-24">
          <div className="rounded-xl border border-subtle bg-surface-raised p-6 shadow-sm md:p-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-display-section text-emerald-deep">Request a quote</h2>
              <p className="mt-3 text-body text-ink-soft">
                Messages go to our real contact inbox — we reply within one working day.
              </p>
              <p className="mt-3 text-meta text-ink-soft">
                Prefer the main site?{' '}
                <a
                  href={hubHref('contact?intent=project')}
                  className="font-semibold text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
                >
                  Start a project on SleeklyBuilt
                </a>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2" noValidate>
              <div>
                <label htmlFor="rainbow-name" className="block text-meta font-semibold text-emerald-deep">
                  Full name *
                </label>
                <input
                  id="rainbow-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={fieldClassFor('name')}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name && attempted)}
                  aria-describedby={errors.name && attempted ? 'rainbow-name-error' : undefined}
                  required
                />
                <FieldError id="name" />
              </div>
              <div>
                <label htmlFor="rainbow-email" className="block text-meta font-semibold text-emerald-deep">
                  Email *
                </label>
                <input
                  id="rainbow-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={fieldClassFor('email')}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email && attempted)}
                  aria-describedby={errors.email && attempted ? 'rainbow-email-error' : undefined}
                  required
                />
                <FieldError id="email" />
              </div>
              <div>
                <label htmlFor="rainbow-phone" className="block text-meta font-semibold text-emerald-deep">
                  Phone *
                </label>
                <input
                  id="rainbow-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={fieldClassFor('phone')}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone && attempted)}
                  aria-describedby={errors.phone && attempted ? 'rainbow-phone-error' : undefined}
                  required
                />
                <FieldError id="phone" />
              </div>
              <div>
                <label htmlFor="rainbow-company" className="block text-meta font-semibold text-emerald-deep">
                  Company
                </label>
                <input
                  id="rainbow-company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={fieldClass}
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="rainbow-service" className="block text-meta font-semibold text-emerald-deep">
                  Service needed *
                </label>
                <select
                  id="rainbow-service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className={fieldClassFor('service')}
                  aria-invalid={Boolean(errors.service && attempted)}
                  aria-describedby={errors.service && attempted ? 'rainbow-service-error' : undefined}
                  required
                >
                  <option value="">Select a service</option>
                  <option value="frontend">Frontend Development</option>
                  <option value="backend">Backend Development</option>
                  <option value="fullstack">Full-Stack Development</option>
                  <option value="mobile">Mobile App Development</option>
                  <option value="uiux">UI/UX Design</option>
                  <option value="other">Other</option>
                </select>
                <FieldError id="service" />
              </div>
              <div>
                <label htmlFor="rainbow-budget" className="block text-meta font-semibold text-emerald-deep">
                  Budget range
                </label>
                <select
                  id="rainbow-budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className={fieldClass}
                >
                  <option value="">Select budget range</option>
                  <option value="under-1m">Under UGX 1,000,000</option>
                  <option value="1m-3m">UGX 1M - 3M</option>
                  <option value="3m-10m">UGX 3M - 10M</option>
                  <option value="over-10m">Over UGX 10M</option>
                  <option value="discuss">Let&apos;s discuss</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="rainbow-timeline" className="block text-meta font-semibold text-emerald-deep">
                  Timeline *
                </label>
                <select
                  id="rainbow-timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className={fieldClass}
                  required
                >
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="urgent">ASAP (under 1 month)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="rainbow-message" className="block text-meta font-semibold text-emerald-deep">
                  Project details *
                </label>
                <textarea
                  id="rainbow-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className={fieldClassFor('message')}
                  aria-invalid={Boolean(errors.message && attempted)}
                  aria-describedby={errors.message && attempted ? 'rainbow-message-error' : undefined}
                  required
                />
                <FieldError id="message" />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.name ||
                    !formData.email ||
                    !formData.phone ||
                    !formData.service ||
                    !formData.message
                  }
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-action-primary-hover px-6 text-meta font-semibold text-cream transition hover:bg-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-dos disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Send quote request'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-16 rounded-xl bg-obsidian px-6 py-12 text-center text-cream md:px-10">
          <h2 className="font-display text-display-section text-cream">Prefer to talk first?</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-cream/70">
            Email or call — no fabricated delivery stats, just a real reply within one working day.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-6 text-meta font-semibold text-ink transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse sm:w-auto"
            >
              Email {siteConfig.email}
            </a>
            <a
              href={`tel:${siteConfig.primaryPhone}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-cream/25 px-6 text-meta font-semibold text-cream transition hover:bg-cream/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-dos-inverse sm:w-auto"
            >
              Call {siteConfig.primaryPhone}
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
