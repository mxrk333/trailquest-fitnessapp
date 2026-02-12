import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  hideLogActivity?: boolean // Hide "Log Activity" button (for trainer viewing client page)
}

export function DashboardLayout({ children, hideLogActivity = false }: DashboardLayoutProps) {
  const { user, profile } = useAuth()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out', error)
    }
  }

  const allNavItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/log-activity', icon: 'add_circle', label: 'Log Activity' },
    ...(profile?.role === 'trainer'
      ? [{ path: '/trainer-assignments', icon: 'assignment', label: 'Your Assigned Tasks' }]
      : [{ path: '/assigned-tasks', icon: 'assignment', label: 'Assigned Tasks' }]),
    { path: '/analytics', icon: 'trending_up', label: 'Analytics' },
    { path: '/settings', icon: 'tune', label: 'Settings' },
  ]

  // Filter out Log Activity if hideLogActivity is true OR if user is a trainer
  const navItems =
    hideLogActivity || profile?.role === 'trainer'
      ? allNavItems.filter(item => item.path !== '/log-activity')
      : allNavItems

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#0f0f14] to-[#14141a] text-slate-200 font-display antialiased h-screen overflow-hidden flex relative">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-20 lg:w-72 flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col justify-between h-full transition-all duration-300 relative z-10 shadow-2xl">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-green-400 rounded-xl flex items-center justify-center text-background-dark font-black text-xl shadow-lg shadow-primary/50 transform group-hover:scale-110 transition-transform">
                TQ
              </div>
            </div>
            <span className="ml-4 font-black text-2xl tracking-tight hidden lg:block bg-gradient-to-r from-white to-primary bg-clip-text text-transparent drop-shadow-lg">
              TrailQuest
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-3 lg:px-4 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-xl group transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary shadow-lg shadow-primary/30'
                      : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                  }`}
                >
                  <span className="material-icons text-xl">{item.icon}</span>
                </div>
                <span className="ml-4 font-semibold hidden lg:block tracking-wide">
                  {item.label}
                </span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/50 hidden lg:block"></div>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent relative">
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/50">
                <img
                  src={
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=13EC5B&color=0a0f0d&bold=true`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="hidden lg:block overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">
                {profile?.displayName || user?.displayName || 'Trainee'}
              </p>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                {profile?.role || 'Trainee'}
              </p>
            </div>
            <span className="material-icons text-slate-400 hidden lg:block group-hover:text-white transition-colors">
              {showMenu ? 'expand_more' : 'chevron_right'}
            </span>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-3 bg-surface-dark/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Link
                to="/settings"
                className="w-full text-left px-5 py-4 text-sm text-slate-300 hover:bg-primary/10 hover:text-primary transition-all duration-200 flex items-center gap-3 group"
              >
                <span className="material-icons text-lg group-hover:scale-110 transition-transform">
                  settings
                </span>
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-5 py-4 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 flex items-center gap-3 border-t border-white/10 group"
              >
                <span className="material-icons text-lg group-hover:scale-110 transition-transform">
                  logout
                </span>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Gradient mesh overlay */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none z-0"></div>

        {/* Content with padding */}
        <div className="relative z-10 p-6 lg:p-10 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  )
}
