import { Link } from 'react-router-dom'

/**
 * Minimal markdown → React for public policy bodies.
 * Escapes HTML; supports headings, paragraphs, lists, bold/italic, links.
 */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(text, keyPrefix) {
  const src = escapeHtml(text)
  const parts = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) {
      parts.push(src.slice(last, m.index))
    }
    const token = m[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*')) {
      parts.push(
        <em key={`${keyPrefix}-i-${i}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={`${keyPrefix}-c-${i}`} className="rounded bg-cream-deep/80 px-1 text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const href = linkMatch[2]
        const label = linkMatch[1]
        const internal = href.startsWith('/')
        parts.push(
          internal ? (
            <Link
              key={`${keyPrefix}-a-${i}`}
              to={href}
              className="text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              {label}
            </Link>
          ) : (
            <a
              key={`${keyPrefix}-a-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dos"
            >
              {label}
            </a>
          ),
        )
      } else {
        parts.push(token)
      }
    }
    last = m.index + token.length
    i += 1
  }
  if (last < src.length) {
    parts.push(src.slice(last))
  }
  return parts
}

/**
 * @param {{ markdown: string, className?: string }} props
 */
export default function SimpleMarkdown({ markdown, className = '' }) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') {
      i += 1
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h2' : 'h3'
      const cls =
        level <= 2
          ? 'mt-10 font-display text-xl font-semibold text-emerald-deep first:mt-0 md:text-2xl'
          : 'mt-8 font-display text-lg font-semibold text-emerald-deep'
      blocks.push(
        <Tag key={`h-${key++}`} className={cls}>
          {renderInline(heading[2], `h${key}`)}
        </Tag>,
      )
      i += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i += 1
      }
      blocks.push(
        <ul key={`ul-${key++}`} className="mt-4 list-disc space-y-2 pl-5 text-body text-ink-soft">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${key}-${idx}`)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i += 1
      }
      blocks.push(
        <ol key={`ol-${key++}`} className="mt-4 list-decimal space-y-2 pl-5 text-body text-ink-soft">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ol-${key}-${idx}`)}</li>
          ))}
        </ol>,
      )
      continue
    }

    const para = [line]
    i += 1
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3})\s+/.test(lines[i]) && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i])) {
      para.push(lines[i])
      i += 1
    }
    blocks.push(
      <p key={`p-${key++}`} className="mt-4 text-body leading-relaxed text-ink-soft first:mt-0">
        {renderInline(para.join(' '), `p${key}`)}
      </p>,
    )
  }

  return <div className={className}>{blocks}</div>
}
