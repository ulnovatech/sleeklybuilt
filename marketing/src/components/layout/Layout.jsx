import { Toaster } from 'react-hot-toast'
import Header from './Header'
import Footer from './Footer'
import FloatingContact from './FloatingContact'
import ScrollToTop from './ScrollToTop'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Toaster position="bottom-right" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
      <ScrollToTop />
    </div>
  )
}
