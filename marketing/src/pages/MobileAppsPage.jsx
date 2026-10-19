import ProductPageLayout from '../components/site/ProductPageLayout'
import { mobileAppsContent } from '../config/productPages'
import { productCta } from '../config/productCtas'

export default function MobileAppsPage() {
  const cta = productCta('mobile-apps')
  return (
    <ProductPageLayout
      eyebrow={mobileAppsContent.eyebrow}
      title={mobileAppsContent.title}
      intro={mobileAppsContent.intro}
      features={mobileAppsContent.features}
      faq={mobileAppsContent.faq}
      primaryAction={{ href: cta.href, label: cta.label }}
    />
  )
}
