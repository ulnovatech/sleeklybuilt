import ProductPageLayout from '../components/site/ProductPageLayout'
import LayoutsGallery from '../components/site/LayoutsGallery'
import Reveal from '../components/motion/Reveal'
import { sleekPagesContent } from '../config/productPages'
import { productCta } from '../config/productCtas'

export default function SleekPagesPage() {
  const cta = productCta('sleek-pages')
  return (
    <ProductPageLayout
      eyebrow={sleekPagesContent.eyebrow}
      title={sleekPagesContent.title}
      intro={sleekPagesContent.intro}
      features={sleekPagesContent.features}
      faq={sleekPagesContent.faq}
      primaryAction={{ href: cta.href, label: cta.label }}
      secondaryAction={{ href: '#layouts', label: 'Browse layouts' }}
    >
      <Reveal>
        <LayoutsGallery
          collection="sleek-pages"
          eyebrow="Sleek Pages gallery"
          title="Layouts ready to personalise"
          intro="Each layout is a finished foundation we brand for you. Choose a business type, read the category story, then open a live preview."
          emptyTitle="Sleek Pages gallery is filling up"
          emptyBody="We have not published Sleek Pages here yet. Start a project and we will match you to a layout — or browse our full website layouts meanwhile."
          ctaLabel="Order this layout"
        />
      </Reveal>
    </ProductPageLayout>
  )
}
