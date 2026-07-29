export default function FooterLinks({ title, links }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-gold">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-cream/85 transition hover:text-gold focus:outline-none focus-visible:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
