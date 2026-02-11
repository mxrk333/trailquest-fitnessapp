import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers/AuthProvider'
import { getDailyNutrition } from '@/services/firestore/nutrition'

export function NutritionWidget() {
  const { user } = useAuth()

  const { data: nutritionLogs = [] } = useQuery({
    queryKey: ['nutrition-today', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getDailyNutrition(user.uid, new Date())
    },
    enabled: !!user?.uid,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const totals = nutritionLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      water: acc.water + log.water,
    }),
    { calories: 0, protein: 0, water: 0 }
  )

  const targets = {
    calories: 2000,
    protein: 150,
    water: 3,
  }

  const getProgress = (current: number, target: number) => Math.min((current / target) * 100, 100)

  return (
    <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-6 rounded-2xl backdrop-blur-xl shadow-xl hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">
              Today's Nutrition
            </h3>
            <p className="text-lg font-bold text-white">{nutritionLogs.length} meals</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full border border-primary/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] font-semibold text-green-400">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-icons text-blue-400 text-sm">local_fire_department</span>
                <span className="text-slate-200 font-semibold">Calories</span>
              </div>
              <span className="text-slate-400 font-mono text-xs">
                <span className="text-white font-bold">{totals.calories}</span> / {targets.calories}
              </span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 shadow-md shadow-blue-500/40"
                style={{ width: `${getProgress(totals.calories, targets.calories)}%` }}
              ></div>
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-icons text-orange-400 text-sm">fitness_center</span>
                <span className="text-slate-200 font-semibold">Protein</span>
              </div>
              <span className="text-slate-400 font-mono text-xs">
                <span className="text-white font-bold">{totals.protein.toFixed(0)}g</span> /{' '}
                {targets.protein}g
              </span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-700 shadow-md shadow-orange-500/40"
                style={{ width: `${getProgress(totals.protein, targets.protein)}%` }}
              ></div>
            </div>
          </div>

          {/* Hydration */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-icons text-cyan-400 text-sm">water_drop</span>
                <span className="text-slate-200 font-semibold">Hydration</span>
              </div>
              <span className="text-slate-400 font-mono text-xs">
                <span className="text-white font-bold">{totals.water.toFixed(1)}L</span> /{' '}
                {targets.water}L
              </span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 shadow-md shadow-cyan-500/40"
                style={{ width: `${getProgress(totals.water, targets.water)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
