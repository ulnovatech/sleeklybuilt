import ProductPageLayout from '../components/site/ProductPageLayout'
import LayoutsGallery from '../components/site/LayoutsGallery'
import Reveal from '../components/motion/Reveal'
import { websitesContent } from '../config/productPages'

export default function WebsitesPage() {
  return (
    <ProductPageLayout
      eyebrow={websitesContent.eyebrow}
      title={websitesContent.title}
      intro={websitesContent.intro}
      features={websitesContent.features}
      faq={websitesContent.faq}
      secondaryAction={{ href: '#layouts', label: 'Browse layouts' }}
    >
      <Reveal>
        <LayoutsGallery
          collection="websites"
          eyebrow="Website layouts"
          title="Published sites you can order"
          intro="Every layout below is live. Pick a business type, read what that layout is built to win, then open a preview and order a personalised version."
          emptyTitle="No website layouts published yet"
          emptyBody="Our website gallery is being restocked. Start a project and we will show you options, or check back shortly."
          ctaLabel="Order this layout"
        />
      </Reveal>
    </ProductPageLayout>
  )
}
