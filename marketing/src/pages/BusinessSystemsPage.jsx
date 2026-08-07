import ProductPageLayout from '../components/site/ProductPageLayout'
import { businessSystemsContent } from '../config/productPages'

export default function BusinessSystemsPage() {
  return (
    <ProductPageLayout
      eyebrow={businessSystemsContent.eyebrow}
      title={businessSystemsContent.title}
      intro={businessSystemsContent.intro}
      features={businessSystemsContent.features}
      faq={businessSystemsContent.faq}
    />
  )
}
