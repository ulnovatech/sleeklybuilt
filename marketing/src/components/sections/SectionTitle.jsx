import { SectionHeading } from '../site/Section'

/** @deprecated Prefer SectionHeading directly — kept for backward compatibility */
export default function SectionTitle({ eyebrow, title, description, align = 'center' }) {
  return (
    <SectionHeading
      eyebrow={eyebrow}
      title={title}
      intro={description}
      align={align}
      className={align === 'center' ? 'mx-auto mb-10' : 'mb-10'}
    />
  )
}

