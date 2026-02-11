import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User } from '@repo/shared'
import { DashboardFeed } from '@/components/dashboard/DashboardFeed'
import { ReadinessCard } from '@/components/dashboard/ReadinessCard'
import { MuscleHeatmap } from '@/components/dashboard/MuscleHeatmap'
import { NutritionWidget } from '@/components/dashboard/NutritionWidget'

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) return null
      const clientDoc = await getDoc(doc(db, 'users', clientId))
      if (!clientDoc.exists()) return null
      return { uid: clientDoc.id, ...clientDoc.data() } as User
    },
    enabled: !!clientId,
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary/10 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <span className="material-icons text-6xl text-slate-700 mb-4">person_off</span>
          <h2 className="text-2xl font-bold text-white mb-2">Client Not Found</h2>
          <p className="text-slate-400 mb-6">
            This client does not exist or you don't have access.
          </p>
          <button
            onClick={() => navigate('/trainer')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark font-bold rounded-xl transition-all shadow-lg shadow-primary/30"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trainer')}
            className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
          >
            <span className="material-icons text-slate-400 group-hover:text-white">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                {client.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              {client.displayName || 'Unknown User'}
            </h1>
            <p className="text-gray-400">
              {client.email} • {client.role || 'Trainee'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-primary/5 border border-primary/20 p-6 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Age
              </span>
              <span className="material-icons text-primary">cake</span>
            </div>
            <div className="text-3xl font-bold text-white">{client.age || 'N/A'}</div>
          </div>

          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-blue-900/10 border border-primary/20 p-6 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Weight
              </span>
              <span className="material-icons text-blue-400">monitor_weight</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {client.weight || 'N/A'}
              <span className="text-lg text-slate-400">kg</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-6 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Height
              </span>
              <span className="material-icons text-purple-400">height</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {client.height || 'N/A'}
              <span className="text-lg text-slate-400">cm</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-orange-900/10 border border-primary/20 p-6 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Role
              </span>
              <span className="material-icons text-orange-400">verified_user</span>
            </div>
            <div className="text-xl font-bold text-white capitalize">
              {client.role || 'trainee'}
            </div>
          </div>
        </div>

        {/* Main Grid - Client's Dashboard View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Readiness & Heatmap */}
          <div className="space-y-6">
            <ReadinessCard />
            <NutritionWidget />
          </div>

          {/* Middle Column - Muscle Heatmap */}
          <div className="lg:col-span-2 space-y-6">
            <MuscleHeatmap />
            <DashboardFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
