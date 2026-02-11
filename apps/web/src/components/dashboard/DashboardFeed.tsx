import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers/AuthProvider'
import { getRecentWorkouts } from '@/services/firestore/workouts'
import { getRecentHikes } from '@/services/firestore/hikes'
import { getRecentNutrition } from '@/services/firestore/nutrition'
import { getRecentRestDays } from '@/services/firestore/restDays'
import { ActivityCard } from './ActivityCard'
import { Link } from 'react-router-dom'

export function DashboardFeed() {
  const { user } = useAuth()

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['recent-workouts', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getRecentWorkouts(user.uid, 10)
    },
    enabled: !!user?.uid,
  })

  const { data: hikes = [], isLoading: hikesLoading } = useQuery({
    queryKey: ['recent-hikes', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getRecentHikes(user.uid, 10)
    },
    enabled: !!user?.uid,
  })

  const { data: nutrition = [], isLoading: nutritionLoading } = useQuery({
    queryKey: ['recent-nutrition', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getRecentNutrition(user.uid, 10)
    },
    enabled: !!user?.uid,
  })

  const { data: restDays = [], isLoading: restDaysLoading } = useQuery({
    queryKey: ['recent-rest-days', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getRecentRestDays(user.uid, 10)
    },
    enabled: !!user?.uid,
  })

  const isLoading = workoutsLoading || hikesLoading || nutritionLoading || restDaysLoading

  const allActivities = [
    ...workouts.map(w => ({ type: 'workout' as const, data: w, timestamp: w.timestamp })),
    ...hikes.map(h => ({ type: 'hike' as const, data: h, timestamp: h.timestamp })),
    ...nutrition.map(n => ({ type: 'nutrition' as const, data: n, timestamp: n.timestamp })),
    ...restDays.map(r => ({ type: 'rest' as const, data: r, timestamp: r.timestamp })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-surface-dark to-surface-dark/50 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="material-icons text-primary">history</span>
          Recent Activity
        </h2>
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary/10 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl hover:shadow-primary/10 transition-all duration-500 relative overflow-hidden group">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-icons text-primary">history</span>
            </div>
            Recent Activity
          </h2>
          <Link
            to="/log-activity"
            className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
          >
            <span className="material-icons text-lg">add</span>
            <span>Log Activity</span>
          </Link>
        </div>

        {allActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
              <span className="material-icons text-6xl text-white/10">history</span>
            </div>
            <p className="text-xl font-semibold text-white mb-2">No activities yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Start tracking your fitness journey today!
            </p>
            <Link
              to="/log-activity"
              className="px-6 py-3 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
            >
              Log Your First Activity
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {allActivities.slice(0, 10).map((activity, idx) => (
              <ActivityCard key={idx} activity={activity.data} type={activity.type} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
