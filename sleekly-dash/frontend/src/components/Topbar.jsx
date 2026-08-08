import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-4 sm:px-6 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenu}
          className="btn-icon border-0 bg-transparent lg:hidden"
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-muted sm:block">
          Welcome back — <span className="text-white">{user?.display_name || user?.email || user?.username || 'Team'}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-brand hover:text-white"
        >
          Sign out
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-xs">
          {(user?.display_name || user?.email || user?.username || 'A').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
