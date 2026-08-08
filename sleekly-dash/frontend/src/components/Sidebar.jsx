import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  BriefcaseIcon,
  ChartBarIcon,
  BookOpenIcon,
  PhoneIcon,
  MagnifyingGlassCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { PresentationChartBarIcon } from '@heroicons/react/24/solid'
import brandLogo from '../assets/sleeklybuilt-logo.png'
import { appLinks, siteConfig } from '../site.config'

function externalAppLink(href, label, Icon, onClick) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-sm transition text-muted hover:bg-gray-800/40"
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </a>
  )
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navItem = (to, label, icon) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-sm transition ${
          isActive
            ? 'bg-gradient-to-r from-accent-purple/20 to-accent-blue/10 text-white shadow-neon-lg'
            : 'text-muted hover:bg-gray-800/40'
        }`
      }
    >
      {React.createElement(icon, { className: 'w-5 h-5' })}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  )

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 overflow-y-auto border-r border-gray-800 bg-bg-800 p-4 transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:translate-x-0 ${
      open ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center gap-3 px-2">
        <img
          src={brandLogo}
          alt={`${siteConfig.name} logo`}
          className="w-10 h-10 rounded-lg object-contain p-1"
        />
        <div>
          <div className="text-white font-semibold">{siteConfig.name}</div>
          <div className="text-xs text-muted">{siteConfig.tagline}</div>
        </div>
        <button type="button" onClick={onClose} className="btn-icon ml-auto border-0 bg-transparent lg:hidden" aria-label="Close navigation">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItem('/', 'Dashboard', ChartBarIcon)}
        {navItem('/prospects', 'Prospects', PhoneIcon)}
        {navItem('/companies', 'Companies', BriefcaseIcon)}
        {navItem('/requests', 'Requests', ChartBarIcon)}
        {navItem('/analytics', 'Analytics', PresentationChartBarIcon)}
        {navItem('/competitors', 'Competition', PresentationChartBarIcon)}
        {navItem('/goal', 'Goals', PresentationChartBarIcon)}
        {navItem('/templates', 'Templates', BookOpenIcon)}
        {navItem('/settings', 'Settings', Cog6ToothIcon)}
        {navItem('/blog', 'Blog', BookOpenIcon)}
      </nav>

      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-4 mb-2">
          Apps
        </h3>
        <div className="flex flex-col gap-1">
          {externalAppLink(appLinks.discoveryIntelligence, 'Discovery Intelligence', MagnifyingGlassCircleIcon, onClose)}
          {externalAppLink(appLinks.homeSite, 'Home Site', HomeIcon, onClose)}
          {externalAppLink(appLinks.blog, 'Blog', BookOpenIcon, onClose)}
          {externalAppLink(appLinks.portfolio, 'Portfolio', BriefcaseIcon, onClose)}
        </div>
      </div>
    </aside>
  )
}
