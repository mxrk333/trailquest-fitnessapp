import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/providers/AuthProvider'

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Allow the onboarding page itself through to prevent redirect loop
  if (location.pathname === '/onboarding') {
    return <Outlet />
  }

  // Redirect to onboarding if:
  // 1. No Firestore profile exists (Google auth user), or
  // 2. Profile exists but onboarding not completed
  // Existing users with age set are grandfathered in
  const isOnboarded =
    profile?.onboardingCompleted === true ||
    (profile != null && profile.age != null)

  if (!profile || !isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
