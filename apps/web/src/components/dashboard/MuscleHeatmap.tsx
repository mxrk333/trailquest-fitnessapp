import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useMuscleHeatmap } from '@/hooks/useMuscleHeatmap'

export function MuscleHeatmap() {
  const { user } = useAuth()
  const { data: muscleIntensities = {} } = useMuscleHeatmap(user?.uid)
  const [view, setView] = useState<'front' | 'back'>('front')

  // Helper to get color based on intensity
  const getFill = (muscle: string) => {
    const intensity = muscleIntensities[muscle] || 0
    if (intensity > 0.8) return 'url(#grad-strain)'
    if (intensity > 0.4) return 'url(#grad-med)'
    if (intensity > 0.0) return 'url(#grad-healthy)'
    return '#152e1e'
  }

  const getOpacity = (muscle: string) => {
    const intensity = muscleIntensities[muscle] || 0
    return 0.4 + intensity * 0.6
  }

  return (
    <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 rounded-2xl p-5 backdrop-blur-xl shadow-xl relative overflow-hidden group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="material-icons text-primary text-sm">accessibility</span>
            </div>
            Muscle Heatmap
          </h2>

          {/* Toggle */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-0.5 flex gap-0.5">
            <button
              onClick={() => setView('front')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'front' ? 'bg-gradient-to-r from-primary to-green-400 text-background-dark shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Front
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'back' ? 'bg-gradient-to-r from-primary to-green-400 text-background-dark shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Back
            </button>
          </div>
        </div>

        {/* Compact container */}
        <div className="relative w-full h-[380px] flex items-center justify-center">
          {/* Simplified background circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-[240px] h-[240px] rounded-full border border-primary/10"></div>
            <div className="w-[160px] h-[160px] rounded-full border border-primary/15 absolute"></div>
          </div>

          {/* SVG Body */}
          <svg
            className="h-[340px] w-auto z-10 drop-shadow-[0_0_20px_rgba(19,236,91,0.2)]"
            viewBox="0 0 200 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="grad-healthy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#13ec5b', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0ea640', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="grad-strain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#b91c1c', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="grad-med" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Head */}
            <path
              d="M100,20 C115,20 120,35 120,50 C120,65 110,75 100,75 C90,75 80,65 80,50 C80,35 85,20 100,20"
              fill="#152e1e"
              stroke="#13ec5b"
              strokeWidth="0.5"
            ></path>

            {view === 'front' ? (
              <>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M82,80 Q100,90 118,80 L115,110 Q100,115 85,110 Z"
                  fill={getFill('chest')}
                  opacity={getOpacity('chest')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M75,78 Q60,85 55,100 L65,110 Q75,95 80,82 Z"
                  fill={getFill('shoulders')}
                  opacity={getOpacity('shoulders')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M125,78 Q140,85 145,100 L135,110 Q125,95 120,82 Z"
                  fill={getFill('shoulders')}
                  opacity={getOpacity('shoulders')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M55,102 Q50,120 52,135 L62,135 Q65,120 65,108 Z"
                  fill={getFill('biceps')}
                  opacity={getOpacity('biceps')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M145,102 Q150,120 148,135 L138,135 Q135,120 135,108 Z"
                  fill={getFill('biceps')}
                  opacity={getOpacity('biceps')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M88,115 Q100,118 112,115 L110,160 Q100,165 90,160 Z"
                  fill={getFill('abs')}
                  opacity={getOpacity('abs')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M85,165 Q70,200 75,240 L95,235 Q95,200 95,165 Z"
                  fill={getFill('quads')}
                  opacity={getOpacity('quads')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M115,165 Q130,200 125,240 L105,235 Q105,200 105,165 Z"
                  fill={getFill('quads')}
                  opacity={getOpacity('quads')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
              </>
            ) : (
              <>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M85,80 L115,80 L110,140 L90,140 Z"
                  fill={getFill('back')}
                  opacity={getOpacity('back')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M85,160 Q75,180 85,200 L98,200 L98,160 Z"
                  fill={getFill('glutes')}
                  opacity={getOpacity('glutes')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M115,160 Q125,180 115,200 L102,200 L102,160 Z"
                  fill={getFill('glutes')}
                  opacity={getOpacity('glutes')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M85,205 L95,205 L92,260 L82,260 Z"
                  fill={getFill('hamstrings')}
                  opacity={getOpacity('hamstrings')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M115,205 L105,205 L108,260 L118,260 Z"
                  fill={getFill('hamstrings')}
                  opacity={getOpacity('hamstrings')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M80,265 Q70,290 80,315 L90,310 Z"
                  fill={getFill('calves')}
                  opacity={getOpacity('calves')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
                <path
                  className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                  d="M120,265 Q130,290 120,315 L110,310 Z"
                  fill={getFill('calves')}
                  opacity={getOpacity('calves')}
                  stroke="#13ec5b"
                  strokeWidth="0.5"
                ></path>
              </>
            )}
          </svg>

          {/* Compact Legend */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md border border-white/20 rounded-lg p-2 text-[10px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded bg-gradient-to-b from-green-500 to-emerald-600"></div>
              <span className="text-slate-300">Low</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded bg-gradient-to-b from-orange-500 to-amber-600"></div>
              <span className="text-slate-300">Med</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-b from-red-500 to-red-700"></div>
              <span className="text-slate-300">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
