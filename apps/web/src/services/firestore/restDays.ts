import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore'

const REST_DAYS_COLLECTION = 'rest_days'

export interface RestDay {
  id?: string
  userId: string
  timestamp: Date
  type: 'complete_rest' | 'active_recovery'
  activities?: string[] // e.g., ['yoga', 'walking', 'stretching']
  notes?: string
  duration?: number // minutes for active recovery
  status?: 'completed' | 'pending' | 'missed'
  assignedBy?: string // Trainer ID
}

export async function saveRestDay(restDay: Omit<RestDay, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, REST_DAYS_COLLECTION), {
    ...restDay,
    timestamp: Timestamp.fromDate(restDay.timestamp),
  })
  return docRef.id
}

export async function getRecentRestDays(userId: string, limitCount = 20): Promise<RestDay[]> {
  const q = query(
    collection(db, REST_DAYS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  })) as RestDay[]
}

export async function getRestDayById(
  restDayId: string
): Promise<(RestDay & { id: string }) | null> {
  try {
    const docRef = doc(db, REST_DAYS_COLLECTION, restDayId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: (docSnap.data().timestamp as Timestamp).toDate(),
      } as RestDay & { id: string }
    } else {
      console.log('❌ No such rest day!')
      return null
    }
  } catch (error) {
    console.error('❌ Error fetching rest days:', error)
    throw error
  }
}

export const getPendingRestDays = async (userId: string) => {
  try {
    const q = query(
      collection(db, REST_DAYS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'asc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (RestDay & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching pending rest days:', error)
    throw error
  }
}

export async function updateRestDay(restDayId: string, data: Partial<RestDay>): Promise<void> {
  try {
    const docRef = doc(db, REST_DAYS_COLLECTION, restDayId)
    await updateDoc(docRef, {
      ...data,
      timestamp: data.timestamp ? Timestamp.fromDate(data.timestamp) : undefined,
    })
    console.log('✅ Rest day updated:', restDayId)
  } catch (error) {
    console.error('❌ Error updating rest day:', error)
    throw error
  }
}

export async function deleteRestDay(restDayId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, REST_DAYS_COLLECTION, restDayId))
    console.log('✅ Rest day deleted:', restDayId)
  } catch (error) {
    console.error('❌ Error deleting rest day:', error)
    throw error
  }
}

export const getTrainerRestDayAssignments = async (trainerId: string) => {
  try {
    const q = query(
      collection(db, REST_DAYS_COLLECTION),
      where('assignedBy', '==', trainerId),
      orderBy('timestamp', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (RestDay & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching trainer rest day assignments:', error)
    throw error
  }
}
