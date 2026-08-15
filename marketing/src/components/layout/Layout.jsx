import { Toaster } from 'react-hot-toast'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import AttendantRoot from '../attendant/AttendantRoot'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Toaster position="bottom-right" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AttendantRoot />
      <ScrollToTop />
    </div>
  )
}
