import { Toaster } from 'react-hot-toast'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import AttendantRoot from '../attendant/AttendantRoot'
import { AttendantProvider, useAttendant } from '../attendant/AttendantProvider'
import { cn } from '../../lib/utils'

export default function Layout({ children }) {
  return (
    <AttendantProvider>
      <LayoutShell>{children}</LayoutShell>
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
      <Toaster position="bottom-right" />
      <Header docked={docked} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AttendantRoot />
      <ScrollToTop />
    </div>
  )
}
