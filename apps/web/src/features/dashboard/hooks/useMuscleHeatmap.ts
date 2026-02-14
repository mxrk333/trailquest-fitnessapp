import { useQuery } from '@tanstack/react-query'
import { getRecentWorkouts } from '@/features/workouts/services/workouts'
import { getRecentHikes } from '@/features/hikes/services/hikes'
import { Workout, Hike } from '@repo/shared'

type MuscleIntensity = Record<string, number>

export const useMuscleHeatmap = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['muscleHeatmap', userId],
    queryFn: async () => {
      if (!userId) return {}

      // 1. Fetch recent activity (last 14 days)
      // For simplicity in this demo, we fetch the last 20 items of each.
      // In a real app, we'd query by date range.
      const [workouts, hikes] = await Promise.all([
        getRecentWorkouts(userId, 20),
        getRecentHikes(userId, 20),
      ])

      const now = new Date()
      const intensities: MuscleIntensity = {}

      // Helper to add strain
      const addStrain = (muscles: string[], severity: number, timestamp: Date) => {
        const daysAgo = (now.getTime() - timestamp.getTime()) / (1000 * 3600 * 24)
        if (daysAgo > 14) return // Ignore old stuff

        // Decay factor: 1.0 (today) -> 0.0 (14 days ago)
        // Linear decay for simplicity
        const decay = Math.max(0, 1 - daysAgo / 14)

        muscles.forEach(muscle => {
          const current = intensities[muscle] || 0
          // Accumulate strain: severity * decay
          intensities[muscle] = current + severity * decay
        })
      }

      // 2. Process Workouts
      workouts.forEach(w => {
        w.exercises.forEach(ex => {
          // Calculate set volume/intensity
          const setVolume = ex.sets.filter(s => s.completed).length
          // Base severity on sets. e.g. 3 sets = 0.3 impact.
          const severity = setVolume * 0.1
          if (ex.muscles) {
            addStrain(ex.muscles, severity, w.timestamp)
          }
        })
      })

      // 3. Process Hikes
      hikes.forEach(h => {
        // Hikes are usually endurance, lower impact per minute but long duration.
        // Normalize: 1 hr hike = 0.4 impact on legs
        const durationHours = h.duration / 60
        const severity = durationHours * 0.4
        if (h.activeMuscles) {
          addStrain(h.activeMuscles, severity, h.timestamp)
        }
      })

      // 4. Normalize to 0-1 range for visualization
      // Find max value to scale everything relative to it (or cap at 1.0)
      const maxStrain = Math.max(...Object.values(intensities), 1.0) // Avoid divide by zero

      Object.keys(intensities).forEach(key => {
        // We can either scale relative to max (heatmap style)
        // or clamp at 1.0 (absolute capacity style).
        // Let's clamp at 1.0 for "Readiness" concept (1.0 = fully fried).
        intensities[key] = Math.min(intensities[key], 1.0)
      })

      return intensities
    },
    enabled: !!userId,
  })
}
