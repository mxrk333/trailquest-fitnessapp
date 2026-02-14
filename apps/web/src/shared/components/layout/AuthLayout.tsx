import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col relative overflow-hidden text-white">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Abstract Topo/Muscle lines */}
        <div className="topo-bg w-full h-full absolute inset-0"></div>
        <div className="topo-lines w-full h-full absolute inset-0 bg-repeat opacity-20"></div>
        {/* Large Gradient Orb for subtle glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation / Brand Header (Minimal) */}
      <nav className="relative z-10 w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <span className="material-icons text-background-dark text-xl font-bold">terrain</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Trail<span className="text-primary">Quest</span>
          </span>
        </div>
        <div className="hidden sm:block">
          <a
            className="text-sm font-medium text-gray-400 hover:text-primary transition-colors"
            href="#"
          >
            Need Help?
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-card-dark/80 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            {/* Decorative Top Border Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              <p className="text-gray-400 text-sm">{subtitle}</p>
            </div>

            {children}

            {/* Decorative Side Graphic (Desktop only - Subtle hint of muscle/topo) */}
            <div className="hidden lg:block absolute right-12 bottom-12 w-64 h-64 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-tr from-primary to-transparent rounded-full blur-[80px]"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer Copyright */}
      <footer className="relative z-10 p-6 text-center text-xs text-gray-600">
        © 2023 TrailQuest Inc. All rights reserved.
      </footer>
    </div>
  )
}
