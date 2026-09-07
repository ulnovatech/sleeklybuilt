import React, { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AttendantProvider, AttendantRoot, useAttendant } from '@sleeklybuilt/attendant'
import { cn } from '@sleeklybuilt/design-foundation/react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Order from './pages/Order'
import OrderSuccess from './pages/OrderSuccess'
import Rainbow from './pages/Rainbow'
import { useSiteConfig } from './context/SiteContactContext'

function AppShell() {
  const { open, minimized } = useAttendant()
  const docked = open && !minimized

  return (
    <div
      className={cn(
        'min-h-screen bg-surface-base text-content-primary',
        docked && 'lg:pr-[380px]',
      )}
    >
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<Order />} />
          <Route path="/order/success" element={<OrderSuccess />} />
          <Route path="/rainbow" element={<Rainbow />} />
        </Routes>
      </main>
      <Footer />
      <AttendantRoot />
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  const siteConfig = useSiteConfig()
  const site = useMemo(
    () => ({
      name: siteConfig.name,
      whatsapp: siteConfig.whatsapp,
      primaryPhone: siteConfig.primaryPhone,
      email: siteConfig.email,
    }),
    [siteConfig.name, siteConfig.whatsapp, siteConfig.primaryPhone, siteConfig.email],
  )

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AttendantProvider host="portfolio" basePath="/portfolio-app" site={site}>
        <AppShell />
      </AttendantProvider>
    </Router>
  )
}

export default App
