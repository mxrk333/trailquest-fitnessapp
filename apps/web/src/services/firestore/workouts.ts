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
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
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

export const deleteWorkout = async (workoutId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, workoutId))
    console.log('✅ Workout deleted:', workoutId)
  } catch (error) {
    console.error('❌ Error deleting workout:', error)
    throw error
  }
}

export const updateWorkout = async (workoutId: string, data: Partial<Workout>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, workoutId)
    await updateDoc(docRef, {
      ...data,
      timestamp: data.timestamp ? Timestamp.fromDate(data.timestamp) : undefined,
    })
    console.log('✅ Workout updated:', workoutId)
  } catch (error) {
    console.error('❌ Error updating workout:', error)
    throw error
  }
}

export const getWorkoutById = async (workoutId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, workoutId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: (docSnap.data().timestamp as Timestamp).toDate(),
      } as Workout & { id: string }
    } else {
      console.log('❌ No such workout!')
      return null
    }
  } catch (error) {
    console.error('❌ Error getting workout:', error)
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

export const getPendingWorkouts = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'asc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (Workout & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching pending workouts:', error)
    throw error
  }
}

export const getTrainerAssignments = async (trainerId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('assignedBy', '==', trainerId),
      orderBy('timestamp', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (Workout & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching trainer assignments:', error)
    throw error
  }
}
