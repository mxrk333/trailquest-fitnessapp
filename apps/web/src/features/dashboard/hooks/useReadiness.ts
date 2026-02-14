import { useQuery } from '@tanstack/react-query'
import { useMuscleHeatmap } from './useMuscleHeatmap'
import { getRecentRestDays } from '@/features/rest-days/services/restDays'

export const useReadiness = (userId: string | undefined) => {
  const {
    data: muscleMap,
    isLoading: loadingHeatmap,
    error: errorHeatmap,
  } = useMuscleHeatmap(userId)

  const { data: restDays = [], isLoading: loadingRestDays } = useQuery({
    queryKey: ['readiness-restDays', userId],
    queryFn: async () => {
      if (!userId) return []
      return await getRecentRestDays(userId, 5) // Last 5 rest days
    },
    enabled: !!userId,
  })

  // Calculate a global readiness score based on total systemic strain
  const score = muscleMap
    ? (() => {
        const strains = Object.values(muscleMap)

        // Base readiness from muscle strain
        // If no strain, we are 100% ready (minus fatigue from other things, but simplified: 100)
        let baseReadiness = 100

        if (strains.length > 0) {
          const totalStrain = strains.reduce((a, b) => a + b, 0)
          const systemLoad = totalStrain * 10 // Arbitrary scaling
          baseReadiness = Math.max(0, 100 - systemLoad)
        }

        // Apply Rest Day Bonus
        // Check for rest days in the last 48 hours
        const now = new Date()
        const recentRestDays = restDays.filter(rd => {
          const hoursAgo = (now.getTime() - rd.timestamp.getTime()) / (1000 * 60 * 60)
          return hoursAgo < 48
        })

        // Bonus: +20 for each rest day in last 48h
        // This allows user to recover faster than the passive decay
        const recoveryBonus = recentRestDays.length * 20

        return Math.min(100, Math.round(baseReadiness + recoveryBonus))
      })()
    : 100 // Default to fresh if no data

  return {
    score,
    isLoading: loadingHeatmap || loadingRestDays,
    error: errorHeatmap,
  }
}
