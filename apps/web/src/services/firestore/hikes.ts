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
import { Hike, HikeSchema } from '@repo/shared'
import { sanitizeData } from './utils'

const COLLECTION_NAME = 'hikes'

export const saveHike = async (hikeData: Hike) => {
  try {
    const validatedData = HikeSchema.parse(hikeData)

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...sanitizeData(validatedData),
      timestamp: Timestamp.fromDate(validatedData.timestamp),
    })

    console.log('✅ Hike saved with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error saving hike:', error)
    throw error
  }
}

export const getRecentHikes = async (userId: string, count = 10) => {
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
    })) as (Hike & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching hikes:', error)
    throw error
  }
}
