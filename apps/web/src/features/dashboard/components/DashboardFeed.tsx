import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { getRecentWorkouts, getPendingWorkouts } from '@/features/workouts/services/workouts'
import { getRecentHikes, getPendingHikes } from '@/features/hikes/services/hikes'
import { getRecentNutrition, getPendingNutrition } from '@/features/nutrition/services/nutrition'
import { getRecentRestDays, getPendingRestDays } from '@/features/rest-days/services/restDays'
import { ActivityCard } from './ActivityCard'
import { Link } from 'react-router-dom'

interface DashboardFeedProps {
  userId?: string // Optional: defaults to logged-in user
}

export function DashboardFeed({ userId }: DashboardFeedProps = {}) {
  const { user } = useAuth()
  const targetUserId = userId || user?.uid

  // Fetch Recent Activities
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['recent-workouts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentWorkouts(targetUserId, 10)
    },
    enabled: !!targetUserId,
  })

  const { data: hikes = [], isLoading: hikesLoading } = useQuery({
    queryKey: ['recent-hikes', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentHikes(targetUserId, 10)
    },
    enabled: !!targetUserId,
  })

  const { data: nutrition = [], isLoading: nutritionLoading } = useQuery({
    queryKey: ['recent-nutrition', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentNutrition(targetUserId, 10)
    },
    enabled: !!targetUserId,
  })

  const { data: restDays = [], isLoading: restDaysLoading } = useQuery({
    queryKey: ['recent-rest-days', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentRestDays(targetUserId, 10)
    },
    enabled: !!targetUserId,
  })

  // Fetch Pending Activities
  const { data: pendingWorkouts = [], isLoading: pendingWorkoutsLoading } = useQuery({
    queryKey: ['pending-workouts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getPendingWorkouts(targetUserId)
    },
    enabled: !!targetUserId,
  })

  const { data: pendingHikes = [], isLoading: pendingHikesLoading } = useQuery({
    queryKey: ['pending-hikes', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getPendingHikes(targetUserId)
    },
    enabled: !!targetUserId,
  })

  const { data: pendingNutrition = [], isLoading: pendingNutritionLoading } = useQuery({
    queryKey: ['pending-nutrition', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getPendingNutrition(targetUserId)
    },
    enabled: !!targetUserId,
  })

  const { data: pendingRestDays = [], isLoading: pendingRestDaysLoading } = useQuery({
    queryKey: ['pending-rest-days', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getPendingRestDays(targetUserId)
    },
    enabled: !!targetUserId,
  })

  const isLoading =
    workoutsLoading ||
    hikesLoading ||
    nutritionLoading ||
    restDaysLoading ||
    pendingWorkoutsLoading ||
    pendingHikesLoading ||
    pendingNutritionLoading ||
    pendingRestDaysLoading

  const pendingActivities = [
    ...pendingWorkouts.map(w => ({ type: 'workout' as const, data: w, timestamp: w.timestamp })),
    ...pendingHikes.map(h => ({ type: 'hike' as const, data: h, timestamp: h.timestamp })),
    ...pendingNutrition.map(n => ({ type: 'nutrition' as const, data: n, timestamp: n.timestamp })),
    ...pendingRestDays.map(r => ({ type: 'rest' as const, data: r, timestamp: r.timestamp })),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Oldest first for pending

  const recentActivities = [
    ...workouts
      .filter(w => w.status !== 'pending')
      .map(w => ({ type: 'workout' as const, data: w, timestamp: w.timestamp })),
    ...hikes
      .filter(h => h.status !== 'pending')
      .map(h => ({ type: 'hike' as const, data: h, timestamp: h.timestamp })),
    ...nutrition
      .filter(n => n.status !== 'pending')
      .map(n => ({ type: 'nutrition' as const, data: n, timestamp: n.timestamp })),
    ...restDays
      .filter(r => r.status !== 'pending')
      .map(r => ({ type: 'rest' as const, data: r, timestamp: r.timestamp })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="material-icons text-primary">history</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        </div>
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
    <div className="space-y-10">
      {/* Assigned Activities Section */}
      {pendingActivities.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="material-icons text-blue-400">assignment</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Assigned to You</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tasks from your trainer</p>
              </div>
            </div>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              {pendingActivities.length} Pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingActivities.map((activity, idx) => (
              <ActivityCard key={`pending-${idx}`} activity={activity.data} type={activity.type} />
            ))}
          </div>
        </section>
      )}

      {/* Separator */}
      {pendingActivities.length > 0 && <div className="border-t border-white/5"></div>}

      {/* Recent Activities Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-icons text-primary">history</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your latest sessions</p>
            </div>
          </div>
          <Link
            to="/log-activity"
            className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
          >
            <span className="material-icons text-lg">add</span>
            <span>Log Activity</span>
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            {/* Multi-layer illustration */}
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center border border-white/5">
                <span className="material-icons text-6xl text-white/10">directions_run</span>
              </div>
              {/* Floating activity icons */}
              <div
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 animate-bounce"
                style={{ animationDelay: '0s', animationDuration: '3s' }}
              >
                <span className="material-icons text-primary text-sm">fitness_center</span>
              </div>
              <div
                className="absolute -bottom-1 -right-3 w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10 animate-bounce"
                style={{ animationDelay: '0.5s', animationDuration: '3s' }}
              >
                <span className="material-icons text-blue-400 text-sm">hiking</span>
              </div>
              <div
                className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/10 animate-bounce"
                style={{ animationDelay: '1s', animationDuration: '3s' }}
              >
                <span className="material-icons text-purple-400 text-xs">restaurant</span>
              </div>
            </div>
            <p className="text-xl font-semibold text-white mb-2">Your journey starts here</p>
            <p className="text-sm text-slate-500 mb-1">Log workouts, hikes, meals, and rest days</p>
            <p className="text-sm text-slate-500 mb-6">to build your fitness story.</p>
            <Link
              to="/log-activity"
              className="px-6 py-3 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
            >
              Log Your First Activity
            </Link>
          </div>
        ) : (
          <div className="max-h-[820px] overflow-y-auto space-y-3 pr-1">
            {recentActivities.slice(0, 10).map((activity, idx) => (
              <ActivityCard key={`recent-${idx}`} activity={activity.data} type={activity.type} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
