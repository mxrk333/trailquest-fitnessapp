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

const NUTRITION_COLLECTION = 'nutrition'

export interface NutritionLog {
  id?: string
  userId: string
  timestamp: Date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  protein: number
  carbs: number
  fats: number
  water: number // in liters
  notes?: string
  photoURL?: string
}

export async function saveNutritionLog(log: Omit<NutritionLog, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, NUTRITION_COLLECTION), {
    ...log,
    timestamp: Timestamp.fromDate(log.timestamp),
  })
  return docRef.id
}

export async function getDailyNutrition(userId: string, date: Date): Promise<NutritionLog[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, NUTRITION_COLLECTION),
    where('userId', '==', userId),
    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
    where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('timestamp', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  })) as NutritionLog[]
}

export async function getRecentNutrition(userId: string, limitCount = 20): Promise<NutritionLog[]> {
  const q = query(
    collection(db, NUTRITION_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  })) as NutritionLog[]
}
