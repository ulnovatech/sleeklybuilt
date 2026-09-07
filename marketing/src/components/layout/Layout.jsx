import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AttendantProvider, AttendantRoot, useAttendant } from '@sleeklybuilt/attendant'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import JsonLdSite from '../seo/JsonLdSite'
import Analytics from '../seo/Analytics'
import { useSiteConfig } from '../../context/SiteContactContext'
import { cn } from '../../lib/utils'

export default function Layout({ children }) {
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
    <AttendantProvider host="marketing" site={site}>
      <LayoutShell>{children ?? <Outlet />}</LayoutShell>
    </AttendantProvider>
  )
}

function LayoutShell({ children }) {
  const { open, minimized } = useAttendant()
  const docked = open && !minimized

  return (
    <div
      className={cn('flex min-h-screen flex-col bg-cream text-ink', docked && 'lg:pr-[380px]')}
    >
      <JsonLdSite />
      <Analytics />
      <Toaster position="bottom-right" />
      <Header docked={docked} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AttendantRoot />
      <ScrollToTop />
    </div>
  )
}
