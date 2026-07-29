import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'

export default function App(){
  const [navigationOpen, setNavigationOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      <Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      {navigationOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setNavigationOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="min-w-0 flex-1 flex flex-col">
        <Topbar onMenu={() => setNavigationOpen(true)} />
        <main className="max-w-full overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
