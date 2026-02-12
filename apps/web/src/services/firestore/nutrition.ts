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
  status?: 'completed' | 'pending' | 'missed'
  assignedBy?: string // Trainer ID
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

export async function getNutritionLogById(
  logId: string
): Promise<(NutritionLog & { id: string }) | null> {
  try {
    const docRef = doc(db, NUTRITION_COLLECTION, logId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: (docSnap.data().timestamp as Timestamp).toDate(),
      } as NutritionLog & { id: string }
    } else {
      console.log('❌ No such nutrition log!')
      return null
    }
  } catch (error) {
    console.error('❌ Error getting nutrition log:', error)
    throw error
  }
}

export const getPendingNutrition = async (userId: string) => {
  try {
    const q = query(
      collection(db, NUTRITION_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'asc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (NutritionLog & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching pending nutrition:', error)
    throw error
  }
}

export async function updateNutritionLog(
  logId: string,
  data: Partial<NutritionLog>
): Promise<void> {
  try {
    const docRef = doc(db, NUTRITION_COLLECTION, logId)
    await updateDoc(docRef, {
      ...data,
      timestamp: data.timestamp ? Timestamp.fromDate(data.timestamp) : undefined,
    })
    console.log('✅ Nutrition log updated:', logId)
  } catch (error) {
    console.error('❌ Error updating nutrition log:', error)
    throw error
  }
}

export async function deleteNutritionLog(logId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, NUTRITION_COLLECTION, logId))
    console.log('✅ Nutrition log deleted:', logId)
  } catch (error) {
    console.error('❌ Error deleting nutrition log:', error)
    throw error
  }
}

export const getTrainerNutritionAssignments = async (trainerId: string) => {
  try {
    const q = query(
      collection(db, NUTRITION_COLLECTION),
      where('assignedBy', '==', trainerId),
      orderBy('timestamp', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as (NutritionLog & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching trainer nutrition assignments:', error)
    throw error
  }
}
