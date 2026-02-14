import { ReactNode } from 'react'

export interface FeatureGateProps {
  children: ReactNode
  isLocked: boolean
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

/**
 * Wraps a feature. If locked, renders a blurred overlay with an action prompt.
 */
export function FeatureGate({
  children,
  isLocked,
  title = 'Pro Feature',
  description = 'Upgrade to unlock this feature',
  actionLabel = 'Upgrade',
  onAction,
  icon,
}: FeatureGateProps) {
  if (!isLocked) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred content teaser */}
      <div className="blur-[6px] opacity-40 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
            {icon || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-400"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1">{title}</p>
            <p className="text-slate-400 text-xs">{description}</p>
          </div>
          {onAction && (
            <button
              onClick={onAction}
              className="px-5 py-2 bg-gradient-to-r from-primary to-green-400 text-background-dark rounded-xl text-xs font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
