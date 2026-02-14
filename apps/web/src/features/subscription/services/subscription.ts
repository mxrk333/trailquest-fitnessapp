import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'

const USERS_COLLECTION = 'users'

export type SubscriptionTier = 'free' | 'pro'

const FREE_CLIENT_LIMIT = 1

/**
 * Get the subscription tier for a user.
 * Defaults to 'free' if not set.
 */
export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) return 'free'
  return (snapshot.data().subscriptionTier as SubscriptionTier) || 'free'
}

/**
 * Upgrade user to Pro tier.
 * In production this would be called after Stripe confirms payment.
 * For demo purposes it writes directly to Firestore.
 */
export async function upgradeToPro(userId: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  await updateDoc(userRef, { subscriptionTier: 'pro' })
}

/**
 * Downgrade user back to Free tier.
 */
export async function downgradeToFree(userId: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  await updateDoc(userRef, { subscriptionTier: 'free' })
}

/**
 * Check whether a trainer can add another client based on their tier.
 * Free = 1 client max, Pro = unlimited.
 */
export async function canAddClient(
  trainerId: string,
  currentClientCount: number
): Promise<boolean> {
  const tier = await getSubscriptionTier(trainerId)
  if (tier === 'pro') return true
  return currentClientCount < FREE_CLIENT_LIMIT
}
