import { Section, SectionHeading } from '../site/Section'
import { BulletList } from '../site/ui'

const beforeItems = [
  'Orders arrive in email, WhatsApp, and on paper.',
  'Staff forget tasks because no one owns them.',
  'Customers wait, because no one knows the status.',
  'Reports take hours, because the data lives in five places.',
]

const afterItems = [
  'Orders land in one place, sorted and ready.',
  'Each task has an owner — nothing slips.',
  'Customers receive updates automatically.',
  'Reports appear the moment you need them.',
]

export default function BeforeAfterSection() {
  return (
    <Section className="scroll-mt-24 py-16 md:py-24" id="transformation">
      <SectionHeading
        eyebrow="The change you'll feel"
        title={
          <>
            From a day that feels chaotic to one that <em className="italic text-emerald">runs itself.</em>
          </>
        }
        intro="Most clients come to us with the same problem: too many tools, too much manual work, too many things slipping. Here's what changes when software is built properly."
        align="center"
        className="mx-auto"
      />

      <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="rounded-2xl border border-cream-deep bg-cream-deep/60 p-8 md:p-10">
          <div className="eyebrow text-ink-soft">Before</div>
          <h3 className="serif mt-4 text-2xl leading-tight text-ink md:text-3xl">Everything everywhere.</h3>
          <div className="mt-8">
            <BulletList items={beforeItems} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-emerald-deep p-8 text-cream md:p-10">
          <div
            className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="eyebrow text-gold">After</div>
          <h3 className="serif relative mt-4 text-2xl leading-tight md:text-3xl">Everything in one calm place.</h3>
          <div className="relative mt-8">
            <BulletList items={afterItems} variant="inverse" />
          </div>
        </div>
      </div>
    </Section>
  )
}
