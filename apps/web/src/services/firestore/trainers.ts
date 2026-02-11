import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { User } from '@repo/shared'

const USERS_COLLECTION = 'users'

export async function getTrainerClients(trainerId: string): Promise<User[]> {
  try {
    // Query 1: Users assigned to this trainer via 'trainerId'
    const assignedQuery = query(
      collection(db, USERS_COLLECTION),
      where('trainerId', '==', trainerId)
    )
    const assignedSnapshot = await getDocs(assignedQuery)

    // Query 2: Users who have granted access via 'allowedTrainers' array
    // Fetch the trainer's email to query by allowedTrainers (which stores emails)
    const trainerDocRef = doc(db, USERS_COLLECTION, trainerId)
    const trainerDoc = await getDoc(trainerDocRef)
    const trainerEmail = trainerDoc.data()?.email

    const allDocs = new Map<string, User>()

    // Add assigned clients
    assignedSnapshot.docs.forEach(d => allDocs.set(d.id, { uid: d.id, ...d.data() } as User))

    // Add clients who granted access via email
    if (trainerEmail) {
      const allowedQuery = query(
        collection(db, USERS_COLLECTION),
        where('allowedTrainers', 'array-contains', trainerEmail)
      )
      const allowedSnapshot = await getDocs(allowedQuery)
      allowedSnapshot.docs.forEach(d => allDocs.set(d.id, { uid: d.id, ...d.data() } as User))
    }

    return Array.from(allDocs.values())
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

export async function addClientToTrainer(trainerId: string, clientEmail: string) {
  // 1. Find user by email
  const q = query(collection(db, USERS_COLLECTION), where('email', '==', clientEmail))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error('User not found')
  }

  const clientDoc = snapshot.docs[0]
  const client = clientDoc.data() as User

  // 2. Check if already assigned
  if (client.trainerId === trainerId) {
    return // Already assigned
  }

  // 3. Update user with trainerId
  await updateDoc(doc(db, USERS_COLLECTION, clientDoc.id), {
    trainerId: trainerId,
  })
}
