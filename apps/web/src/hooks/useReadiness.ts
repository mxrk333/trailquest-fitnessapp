import { useMuscleHeatmap } from './useMuscleHeatmap'

export const useReadiness = (userId: string | undefined) => {
  const { data: muscleMap, isLoading, error } = useMuscleHeatmap(userId)

  // Calculate a global readiness score based on total systemic strain
  const score = muscleMap
    ? (() => {
        const strains = Object.values(muscleMap)
        if (strains.length === 0) return 100

        // Average strain of active muscles
        const totalStrain = strains.reduce((a, b) => a + b, 0)
        // const avgStrain = totalStrain / strains.length

        // OR: Max strain determines bottleneck?
        // Let's use a weighted approach:
        // 100 - (Total Systemic Strain * Factor)
        // If you blasted legs (1.0) and chest (1.0), you are tired.

        const systemLoad = totalStrain * 10 // Arbitrary scaling
        const readiness = Math.max(0, 100 - systemLoad)

        return Math.round(readiness)
      })()
    : 100 // Default to fresh if no data

  return { score, isLoading, error }
}
