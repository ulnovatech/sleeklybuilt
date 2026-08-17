import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import RouteScroll from './components/layout/RouteScroll'
import HomePage from './pages/HomePage'
import SleekPagesPage from './pages/SleekPagesPage'
import WebsitesPage from './pages/WebsitesPage'
import MobileAppsPage from './pages/MobileAppsPage'
import BusinessSystemsPage from './pages/BusinessSystemsPage'
import ProductsPage from './pages/ProductsPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import PricesPage from './pages/PricesPage'
import TrackOrderPage from './pages/TrackOrderPage'
import PoliciesPage from './pages/PoliciesPage'
import PolicyDetailPage from './pages/PolicyDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <RouteScroll />
      <Layout>
        <Routes>
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
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
