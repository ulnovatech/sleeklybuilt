import ProductPageLayout from '../components/site/ProductPageLayout'
import { mobileAppsContent } from '../config/productPages'

export default function MobileAppsPage() {
  return (
    <ProductPageLayout
      eyebrow={mobileAppsContent.eyebrow}
      title={mobileAppsContent.title}
      intro={mobileAppsContent.intro}
      features={mobileAppsContent.features}
      faq={mobileAppsContent.faq}
    />
  )
}
