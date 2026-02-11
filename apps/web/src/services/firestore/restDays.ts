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
