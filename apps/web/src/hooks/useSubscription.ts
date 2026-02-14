import { useAuth } from '@/features/auth/providers/AuthProvider'

/**
 * Simple hook to check the current user's subscription tier.
 * Reads from the profile already loaded by AuthProvider — no extra Firestore call.
 */
export function useSubscription() {
  const { profile } = useAuth()
  const tier = profile?.subscriptionTier || 'free'

  return {
    tier,
    isPro: tier === 'pro',
  }
}
