import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, TrendingUp, MessageSquare,
  Upload, Moon, Sun, Brain
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/predictions', icon: TrendingUp, label: 'Predictions' },
  { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/upload', icon: Upload, label: 'Upload CSV' },
]

export default function Layout({ darkMode, setDarkMode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-slate-800 dark:text-white tracking-tight">
            AttriSense
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-700 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Dark mode toggle */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-gray-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
          >
            {darkMode ? <Sun size={16} className="text-blue-400" /> : <Moon size={16} />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="mt-3 flex items-center gap-2 px-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              HR
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-700 dark:text-gray-200">HR Admin</p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500">admin@attrisense.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  )
}
