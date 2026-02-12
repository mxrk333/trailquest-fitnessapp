import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers/AuthProvider'
import { getPendingWorkouts } from '@/services/firestore/workouts'
import { getPendingHikes } from '@/services/firestore/hikes'
import { getPendingNutrition } from '@/services/firestore/nutrition'
import { getPendingRestDays } from '@/services/firestore/restDays'
import { ActivityCard } from '@/components/dashboard/ActivityCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function AssignedTasksPage() {
  const { user } = useAuth()
  const targetUserId = user?.uid

  // Fetch Pending Activities
  const { data: pendingWorkouts = [], isLoading: pendingWorkoutsLoading } = useQuery({
    queryKey: ['pending-workouts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      const result = await getPendingWorkouts(targetUserId)
      console.log('🎯 Pending workouts for trainee:', result)
      return result
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

  console.log('📝 Pending activities for trainee:', pendingActivities.length, {
    pendingWorkouts,
    pendingHikes,
    pendingNutrition,
    pendingRestDays,
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Assigned Tasks</h1>
          <p className="text-gray-400">Tasks assigned to you by your trainer pending completion.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : pendingActivities.length > 0 ? (
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="material-icons text-blue-400">assignment</span>
                </div>
                Your Assignments
              </h2>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {pendingActivities.length} Pending
              </span>
            </div>
            <div className="space-y-4">
              {pendingActivities.map((activity, idx) => (
                <ActivityCard
                  key={`pending-${idx}`}
                  activity={activity.data}
                  type={activity.type}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-surface-dark border border-white/10 rounded-3xl">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <span className="material-icons text-6xl text-white/10">assignment_turned_in</span>
            </div>
            <p className="text-xl font-semibold text-white mb-2">No pending tasks</p>
            <p className="text-sm text-slate-500">
              You're all caught up! Check back later for new assignments.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
