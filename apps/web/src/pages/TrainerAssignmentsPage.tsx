import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers/AuthProvider'
import { getTrainerAssignments } from '@/services/firestore/workouts'
import { getTrainerHikeAssignments } from '@/services/firestore/hikes'
import { getTrainerNutritionAssignments } from '@/services/firestore/nutrition'
import { getTrainerRestDayAssignments } from '@/services/firestore/restDays'
import { ActivityCard } from '@/components/dashboard/ActivityCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { User } from '@repo/shared'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function TrainerAssignmentsPage() {
  const { user } = useAuth()
  const trainerId = user?.uid

  // Fetch all assignments made by this trainer
  const { data: workoutAssignments = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['trainer-workout-assignments', trainerId],
    queryFn: async () => {
      if (!trainerId) return []
      const result = await getTrainerAssignments(trainerId)
      console.log('🔥 Workout assignments fetched:', result)
      return result
    },
    enabled: !!trainerId,
  })

  const { data: hikeAssignments = [], isLoading: hikesLoading } = useQuery({
    queryKey: ['trainer-hike-assignments', trainerId],
    queryFn: async () => {
      if (!trainerId) return []
      return await getTrainerHikeAssignments(trainerId)
    },
    enabled: !!trainerId,
  })

  const { data: nutritionAssignments = [], isLoading: nutritionLoading } = useQuery({
    queryKey: ['trainer-nutrition-assignments', trainerId],
    queryFn: async () => {
      if (!trainerId) return []
      return await getTrainerNutritionAssignments(trainerId)
    },
    enabled: !!trainerId,
  })

  const { data: restDayAssignments = [], isLoading: restDaysLoading } = useQuery({
    queryKey: ['trainer-restday-assignments', trainerId],
    queryFn: async () => {
      if (!trainerId) return []
      return await getTrainerRestDayAssignments(trainerId)
    },
    enabled: !!trainerId,
  })

  const isLoading = workoutsLoading || hikesLoading || nutritionLoading || restDaysLoading

  const allAssignments = [
    ...workoutAssignments.map(w => ({ type: 'workout' as const, data: w, timestamp: w.timestamp })),
    ...hikeAssignments.map(h => ({ type: 'hike' as const, data: h, timestamp: h.timestamp })),
    ...nutritionAssignments.map(n => ({
      type: 'nutrition' as const,
      data: n,
      timestamp: n.timestamp,
    })),
    ...restDayAssignments.map(r => ({ type: 'rest' as const, data: r, timestamp: r.timestamp })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Most recent first

  console.log('📊 Total assignments:', allAssignments.length, {
    workoutAssignments,
    hikeAssignments,
    nutritionAssignments,
    restDayAssignments,
  })

  // Group assignments by status
  const pendingAssignments = allAssignments.filter(a => a.data.status === 'pending')
  const completedAssignments = allAssignments.filter(a => a.data.status === 'completed')

  console.log('📋 Pending:', pendingAssignments.length, 'Completed:', completedAssignments.length)

  // Fetch user data for all unique userIds
  const uniqueUserIds = Array.from(new Set(allAssignments.map(a => a.data.userId).filter(Boolean)))

  const { data: usersMap = new Map<string, User>(), isLoading: usersLoading } = useQuery({
    queryKey: ['assignment-users', uniqueUserIds],
    queryFn: async () => {
      const userMap = new Map<string, User>()
      await Promise.all(
        uniqueUserIds.map(async userId => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId))
            if (userDoc.exists()) {
              userMap.set(userId, { uid: userDoc.id, ...userDoc.data() } as User)
            }
          } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error)
          }
        })
      )
      return userMap
    },
    enabled: uniqueUserIds.length > 0,
  })

  // Group assignments by trainee
  const assignmentsByTrainee = allAssignments.reduce(
    (acc, assignment) => {
      const userId = assignment.data.userId
      if (!userId) return acc

      if (!acc[userId]) {
        acc[userId] = []
      }
      acc[userId].push(assignment)
      return acc
    },
    {} as Record<string, typeof allAssignments>
  )

  const isLoadingAll = isLoading || usersLoading

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Assigned Tasks</h1>
          <p className="text-gray-400">Track all activities you've assigned to your clients.</p>
        </div>

        {isLoadingAll ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : allAssignments.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(assignmentsByTrainee).map(([userId, traineeAssignments]) => {
              const trainee = usersMap.get(userId)
              const traineeName = trainee?.displayName || trainee?.email || 'Unknown User'
              const traineePending = traineeAssignments.filter(a => a.data.status === 'pending')
              const traineeCompleted = traineeAssignments.filter(a => a.data.status === 'completed')

              return (
                <div
                  key={userId}
                  className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
                >
                  {/* Trainee Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-icons text-primary text-2xl">person</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white">{traineeName}</h2>
                      <p className="text-sm text-slate-400">
                        {traineeAssignments.length} total assignment
                        {traineeAssignments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {traineePending.length > 0 && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {traineePending.length} Pending
                        </span>
                      )}
                      {traineeCompleted.length > 0 && (
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {traineeCompleted.length} Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pending Tasks for this Trainee */}
                  {traineePending.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-icons text-yellow-400 text-xl">
                          pending_actions
                        </span>
                        Pending Tasks
                      </h3>
                      <div className="space-y-4">
                        {traineePending.map((activity, idx) => (
                          <ActivityCard
                            key={`${userId}-pending-${idx}`}
                            activity={activity.data}
                            type={activity.type}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Tasks for this Trainee */}
                  {traineeCompleted.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-icons text-primary text-xl">check_circle</span>
                        Completed Tasks
                      </h3>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {traineeCompleted.map((activity, idx) => (
                          <ActivityCard
                            key={`${userId}-completed-${idx}`}
                            activity={activity.data}
                            type={activity.type}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-surface-dark border border-white/10 rounded-3xl">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <span className="material-icons text-6xl text-white/10">assignment</span>
            </div>
            <p className="text-xl font-semibold text-white mb-2">No assignments yet</p>
            <p className="text-sm text-slate-500">
              Start assigning tasks to your clients from their detail pages.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
