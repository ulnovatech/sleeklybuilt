import ProductPageLayout from '../components/site/ProductPageLayout'
import { businessSystemsContent } from '../config/productPages'
import { productCta } from '../config/productCtas'

export default function BusinessSystemsPage() {
  const cta = productCta('business-systems')
  return (
    <ProductPageLayout
      eyebrow={businessSystemsContent.eyebrow}
      title={businessSystemsContent.title}
      intro={businessSystemsContent.intro}
      features={businessSystemsContent.features}
      faq={businessSystemsContent.faq}
      primaryAction={{ href: cta.href, label: cta.label }}
    />
  )
}
