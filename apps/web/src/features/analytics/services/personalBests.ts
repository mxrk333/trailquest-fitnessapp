import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { Exercise, Set } from '@repo/shared'

export interface PersonalBest {
  exerciseName: string
  weight: number
  reps: number
  date: Date
  workoutId: string
}

/**
 * Scans all workouts for a user and finds the maximum weight lifted per exercise.
 * Returns a map of exercise name → personal best record.
 */
export async function getPersonalBests(userId: string): Promise<PersonalBest[]> {
  try {
    const q = query(collection(db, 'workouts'), where('userId', '==', userId))

    const snapshot = await getDocs(q)
    const bestMap = new Map<string, PersonalBest>()

    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const timestamp = (data.timestamp as Timestamp).toDate()
      const exercises = (data.exercises || []) as Exercise[]

      exercises.forEach(exercise => {
        const name = exercise.name
        if (!name) return

        // Find the heaviest set in this exercise
        const sets = (exercise.sets || []) as Set[]
        sets.forEach(set => {
          const weight = Number(set.weight) || 0
          const reps = Number(set.reps) || 0

          if (weight <= 0) return

          const existing = bestMap.get(name)
          if (!existing || weight > existing.weight) {
            bestMap.set(name, {
              exerciseName: name,
              weight,
              reps,
              date: timestamp,
              workoutId: doc.id,
            })
          }
        })
      })
    })

    // Sort by weight descending
    return Array.from(bestMap.values()).sort((a, b) => b.weight - a.weight)
  } catch (error) {
    console.error('❌ Error fetching personal bests:', error)
    throw error
  }
}
