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
import { Hike, HikeSchema } from '@repo/shared'
import { sanitizeData } from '@/shared/services/utils'

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

export const deleteHike = async (hikeId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, hikeId))
    console.log('✅ Hike deleted:', hikeId)
  } catch (error) {
    console.error('❌ Error deleting hike:', error)
    throw error
  }
}

export const updateHike = async (hikeId: string, data: Partial<Hike>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, hikeId)
    await updateDoc(docRef, {
      ...data,
      timestamp: data.timestamp ? Timestamp.fromDate(data.timestamp) : undefined,
    })
    console.log('✅ Hike updated:', hikeId)
  } catch (error) {
    console.error('❌ Error updating hike:', error)
    throw error
  }
}

export const getHikeById = async (hikeId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, hikeId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: (docSnap.data().timestamp as Timestamp).toDate(),
      } as Hike & { id: string }
    } else {
      console.log('❌ No such hike!')
      return null
    }
  } catch (error) {
    console.error('❌ Error getting hike:', error)
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

export const getPendingHikes = async (userId: string) => {
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
    })) as (Hike & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching pending hikes:', error)
    throw error
  }
}

export const getTrainerHikeAssignments = async (trainerId: string) => {
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
    })) as (Hike & { id: string })[]
  } catch (error) {
    console.error('❌ Error fetching trainer hike assignments:', error)
    throw error
  }
}
