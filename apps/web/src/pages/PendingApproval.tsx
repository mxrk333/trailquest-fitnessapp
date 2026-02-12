import { AuthLayout } from '@/components/layout/AuthLayout'
import { useAuth } from '@/providers/AuthProvider'
import { logOut } from '@/services/firestore/auth/auth.service'
import { useNavigate } from 'react-router-dom'

export function PendingApproval() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
  }

  return (
    <AuthLayout title="Verification Pending" subtitle="Your trainer account is under review">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <span className="material-icons text-3xl text-yellow-500">pending</span>
          </div>
        </div>

        <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Thanks for signing up as a Trainer! To maintain quality standards, our team reviews all
            trainer applications.
          </p>
          <p className="text-gray-400 text-sm">
            Please allow up to 24-48 hours for your account to be approved. You will not be able to
            access the dashboard until approved.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full"
        >
          <span className="material-icons text-sm">logout</span>
          Sign Out
        </button>
      </div>
    </AuthLayout>
  )
}
