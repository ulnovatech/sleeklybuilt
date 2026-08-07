import NavLink from './NavLink'

export default function FooterLinks({ title, links }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-gold">{title}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <NavLink
              item={link}
              className="text-meta text-cream/85 transition hover:text-gold focus:outline-none focus-visible:underline"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
