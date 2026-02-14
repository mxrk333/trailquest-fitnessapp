import { useQuery } from '@tanstack/react-query'
import { getRecentWorkouts } from '@/features/workouts/services/workouts'
import { getRecentHikes } from '@/features/hikes/services/hikes'

export interface ClientMetrics {
  lastActiveDate: Date | null
  status: 'Active' | 'Inactive'
  muscleLoad: number // 0-100 score
  totalActivities: number
}

export function useClientMetrics(clientId: string | undefined) {
  return useQuery({
    queryKey: ['clientMetrics', clientId],
    queryFn: async (): Promise<ClientMetrics> => {
      if (!clientId) {
        return {
          lastActiveDate: null,
          status: 'Inactive',
          muscleLoad: 0,
          totalActivities: 0,
        }
      }

      // Fetch recent activity
      const [workouts, hikes] = await Promise.all([
        getRecentWorkouts(clientId, 10),
        getRecentHikes(clientId, 10),
      ])

      const allActivities = [...workouts, ...hikes].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )

      const lastActiveDate = allActivities[0]?.timestamp || null
      const now = new Date()
      const daysSinceActive = lastActiveDate
        ? (now.getTime() - lastActiveDate.getTime()) / (1000 * 3600 * 24)
        : 999

      // Calculate muscle load (simplified version of useMuscleHeatmap logic)
      let totalLoad = 0
      workouts.forEach(w => {
        w.exercises.forEach(ex => {
          const setCount = ex.sets.filter(s => s.completed).length
          totalLoad += setCount * 2 // Each set = 2 points
        })
      })
      hikes.forEach(h => {
        const durationHours = h.duration / 60
        totalLoad += durationHours * 5 // Each hour = 5 points
      })

      // Normalize to 0-100
      const muscleLoad = Math.min(100, totalLoad)

      return {
        lastActiveDate,
        status: daysSinceActive <= 3 ? 'Active' : 'Inactive',
        muscleLoad: Math.round(muscleLoad),
        totalActivities: allActivities.length,
      }
    },
    enabled: !!clientId,
  })
}
