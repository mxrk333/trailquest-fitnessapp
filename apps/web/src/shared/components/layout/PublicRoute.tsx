import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/providers/AuthProvider'

export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
