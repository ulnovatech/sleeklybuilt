import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import RouteScroll from './components/layout/RouteScroll'
import PerformanteShortcut from './components/performante/PerformanteShortcut'
import HomePage from './pages/HomePage'

const SleekPagesPage = lazy(() => import('./pages/SleekPagesPage'))
const WebsitesPage = lazy(() => import('./pages/WebsitesPage'))
const MobileAppsPage = lazy(() => import('./pages/MobileAppsPage'))
const BusinessSystemsPage = lazy(() => import('./pages/BusinessSystemsPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PricesPage = lazy(() => import('./pages/PricesPage'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'))
const PoliciesPage = lazy(() => import('./pages/PoliciesPage'))
const PolicyDetailPage = lazy(() => import('./pages/PolicyDetailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PerformantePage = lazy(() => import('./pages/PerformantePage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4" role="status" aria-live="polite">
      <p className="text-body text-content-muted">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteScroll />
      <PerformanteShortcut />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/performante" element={<PerformantePage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sleek-pages" element={<SleekPagesPage />} />
            <Route path="/websites" element={<WebsitesPage />} />
            <Route path="/mobile-apps" element={<MobileAppsPage />} />
            <Route path="/business-systems" element={<BusinessSystemsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/policies/:slug" element={<PolicyDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
