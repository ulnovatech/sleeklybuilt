import { useEffect, useRef, useState } from 'react'
import { buttonClass } from './NavMenu'

function NavLink({ item, onNavigate, className = '', style, ...rest }) {
  if (!item.href) {
    return (
      <span className={className} style={style} {...rest}>
        {item.label}
      </span>
    )
  }

  const isExternal = item.href.startsWith('http')

  return (
    <a
      href={item.href}
      className={className}
      style={style}
      onClick={onNavigate}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {item.label}
    </a>
  )
}

function DropdownPanel({ items, depth = 0, onNavigate, tone }) {
  return (
    <ul
      className={`min-w-[14rem] rounded-xl border border-cream-deep bg-white py-2 shadow-lg ring-1 ring-black/5 ${
        depth > 0 ? 'ml-1' : ''
      }`}
    >
      {items.map((item) => (
        <NavDropdownItem key={`${item.label}-${depth}`} item={item} depth={depth} onNavigate={onNavigate} tone={tone} />
      ))}
    </ul>
  )
}

function NavDropdownItem({ item, depth, onNavigate, tone }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const itemClass =
    'block px-4 py-2.5 text-sm text-ink-soft hover:bg-cream hover:text-emerald-deep focus:outline-none focus-visible:bg-cream focus-visible:text-emerald-deep'

  if (item.children?.length) {
    return (
      <li ref={ref} className="relative">
        <button
          type="button"
          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${itemClass}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span>{item.label}</span>
          <span className={`text-xs transition ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {open && (
          <div className={`${depth === 0 ? 'absolute left-0 top-full z-50 pt-2' : 'pl-3 pt-1'}`}>
            <DropdownPanel items={item.children} depth={depth + 1} onNavigate={onNavigate} tone={tone} />
          </div>
        )}
      </li>
    )
  }

  return (
    <li>
      <NavLink item={item} onNavigate={onNavigate} className={itemClass} />
    </li>
  )
}

/** Desktop dropdown (single or nested). */
export default function NavDropdown({ label, items, onNavigate, tone = 'light' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const handleNavigate = () => {
    setOpen(false)
    onNavigate?.()
  }

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${buttonClass[tone]}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <span className={`text-xs transition ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <DropdownPanel items={items} onNavigate={handleNavigate} tone={tone} />
        </div>
      )}
    </li>
  )
}

export { NavLink, DropdownPanel }
