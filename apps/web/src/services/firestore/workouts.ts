import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore'
import { Workout, WorkoutSchema } from '@repo/shared'
import { sanitizeData } from './utils'

const COLLECTION_NAME = 'workouts'

export const saveWorkout = async (workoutData: Workout) => {
  try {
    // Validate data against schema
    const validatedData = WorkoutSchema.parse(workoutData)

    // Add to Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...sanitizeData(validatedData),
      timestamp: Timestamp.fromDate(validatedData.timestamp),
    })

    console.log('✅ Workout saved with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error saving workout:', error)
    throw error
  }
}

export const getRecentWorkouts = async (userId: string, count = 10) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(count)
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (Workout & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching workouts:', error)
    throw error
  }
}
