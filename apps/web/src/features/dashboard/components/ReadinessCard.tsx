import { useAuth } from '@/features/auth/providers/AuthProvider'
import { useReadiness } from '@/features/dashboard/hooks/useReadiness'

interface ReadinessCardProps {
  userId?: string // Optional: defaults to logged-in user
}

export function ReadinessCard({ userId }: ReadinessCardProps = {}) {
  const { user } = useAuth()
  const targetUserId = userId || user?.uid
  const { score: readinessScore } = useReadiness(targetUserId)

  const getStatus = () => {
    if (readinessScore >= 75)
      return {
        label: 'Optimal',
        color: 'text-green-400',
        bg: 'from-green-500/20 to-emerald-500/20',
      }
    if (readinessScore >= 50)
      return {
        label: 'Recovering',
        color: 'text-yellow-400',
        bg: 'from-yellow-500/20 to-orange-500/20',
      }
    return { label: 'High Strain', color: 'text-red-400', bg: 'from-red-500/20 to-pink-500/20' }
  }

  const status = getStatus()
  const circumference = 2 * Math.PI * 80
  const offset = circumference - (readinessScore / 100) * circumference

  return (
    <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden">
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${status.bg} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-700`}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-widest mb-1">
              Trail Readiness
            </h3>
            <p className={`text-2xl font-bold ${status.color} drop-shadow-lg`}>{status.label}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <span className="material-icons text-primary text-2xl">verified_user</span>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center my-8 relative">
          <svg className="transform -rotate-90 filter drop-shadow-2xl" width="200" height="200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-white/5"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#13EC5B" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="text-5xl font-black text-white drop-shadow-2xl animate-pulse">
              {Math.round(readinessScore)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Score</div>
          </div>
        </div>

        {/* Recovery Tip */}
        <div className="mt-6 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/5">
          <div className="flex items-start gap-3">
            <span className="material-icons text-primary text-lg mt-0.5">lightbulb</span>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                Recovery Insight
              </p>
              <p className="text-sm text-slate-300">
                {readinessScore >= 75
                  ? "You're primed for a challenging workout!"
                  : readinessScore >= 50
                    ? 'Consider active recovery today.'
                    : 'Prioritize rest and mobility work.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
