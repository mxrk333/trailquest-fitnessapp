import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { User } from '@repo/shared'
import { getSubscriptionTier } from '@/features/subscription/services/subscription'

const USERS_COLLECTION = 'users'

export async function getTrainerClients(trainerId: string): Promise<User[]> {
  try {
    const allDocs = new Map<string, User>()

    // Query 1: Users assigned to this trainer via 'trainerId'
    try {
      const assignedQuery = query(
        collection(db, USERS_COLLECTION),
        where('trainerId', '==', trainerId)
      )
      const assignedSnapshot = await getDocs(assignedQuery)
      assignedSnapshot.docs.forEach(d => allDocs.set(d.id, { uid: d.id, ...d.data() } as User))
    } catch (err) {
      console.warn('Error fetching assigned clients:', err)
    }

    // Query 2: Users who have granted access via 'allowedTrainers' array
    // Fetch the trainer's email to query by allowedTrainers (which stores emails)
    try {
      const trainerDocRef = doc(db, USERS_COLLECTION, trainerId)
      const trainerDoc = await getDoc(trainerDocRef)
      const trainerEmail = trainerDoc.data()?.email

      if (trainerEmail) {
        const allowedQuery = query(
          collection(db, USERS_COLLECTION),
          where('allowedTrainers', 'array-contains', trainerEmail)
        )
        const allowedSnapshot = await getDocs(allowedQuery)
        allowedSnapshot.docs.forEach(d => allDocs.set(d.id, { uid: d.id, ...d.data() } as User))
      }
    } catch (err) {
      console.warn('Error fetching allowed clients:', err)
    }

    return Array.from(allDocs.values())
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

export async function addClientToTrainer(trainerId: string, clientEmail: string) {
  // 1. Check tier limit before adding
  const clients = await getTrainerClients(trainerId)
  const tier = await getSubscriptionTier(trainerId)
  if (tier !== 'pro' && clients.length >= 1) {
    throw new Error('FREE_TIER_LIMIT: Upgrade to Pro to add more clients.')
  }

  // 2. Find user by email
  const q = query(collection(db, USERS_COLLECTION), where('email', '==', clientEmail))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error('User not found')
  }

  const clientDoc = snapshot.docs[0]
  const client = clientDoc.data() as User

  // 3. Check if already assigned
  if (client.trainerId === trainerId) {
    return // Already assigned
  }

  // 4. Update user with trainerId
  await updateDoc(doc(db, USERS_COLLECTION, clientDoc.id), {
    trainerId: trainerId,
  })
}

export async function getAllTrainers(): Promise<User[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', 'trainer'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[]
  } catch (error) {
    console.error('Error fetching trainers:', error)
    return []
  }
}
