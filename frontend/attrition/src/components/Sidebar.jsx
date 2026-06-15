import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const nav = [
  { to: '/dashboard',   icon: '⊞', label: 'Dashboard' },
  { to: '/employees',   icon: '👥', label: 'Employees' },
  { to: '/predictions', icon: '📊', label: 'Predictions' },
  { to: '/chat',        icon: '💬', label: 'AI Assistant' },
  { to: '/upload',      icon: '↑',  label: 'Upload CSV' },
]

export default function Sidebar({ dark, setDark }) {
  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen
      bg-white dark:bg-gray-900
      border-r border-slate-200 dark:border-gray-800
      transition-colors duration-300">

      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            AttriSense
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 ml-9">
          HR Intelligence Platform
        </p>
      </div>

      <div className="mx-4 h-px bg-slate-100 dark:bg-gray-800 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {nav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-gray-800">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg
            bg-slate-100 dark:bg-gray-800
            text-slate-600 dark:text-gray-400
            hover:bg-slate-200 dark:hover:bg-gray-700
            transition-all duration-200 text-sm"
        >
          <span>{dark ? '☀ Light mode' : '☾ Dark mode'}</span>
          <div className={`w-8 h-4 rounded-full transition-colors duration-300 relative
            ${dark ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300
              ${dark ? 'left-4' : 'left-0.5'}`} />
          </div>
        </button>

        <div className="mt-3 flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            HR
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-gray-300">HR Admin</p>
            <p className="text-xs text-slate-400 dark:text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
