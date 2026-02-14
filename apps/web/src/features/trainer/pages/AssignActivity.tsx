import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { WorkoutLogger } from '@/features/workouts/components/WorkoutLogger'
import { HikeLogger } from '@/features/hikes/components/HikeLogger'
import { NutritionLogger } from '@/features/nutrition/components/NutritionLogger'
import { RestDayLogger } from '@/features/rest-days/components/RestDayLogger'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User } from '@repo/shared'

export function AssignActivity() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'workout' | 'hike' | 'nutrition' | 'rest'>('workout')

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

  const tabs = [
    { id: 'workout' as const, label: 'Gym Workout', icon: 'fitness_center' },
    { id: 'hike' as const, label: 'Trail Hike', icon: 'hiking' },
    { id: 'nutrition' as const, label: 'Nutrition', icon: 'restaurant' },
    { id: 'rest' as const, label: 'Rest Day', icon: 'hotel' },
  ]

  if (isLoading) {
    return (
      <DashboardLayout hideLogActivity={true}>
        <div className="flex items-center justify-center h-screen text-white">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout hideLogActivity={true}>
        <div className="flex flex-col items-center justify-center h-screen text-white">
          <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
          <button onClick={() => navigate('/trainer')} className="text-primary hover:underline">
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout hideLogActivity={true}>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate(`/trainer/client/${clientId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to Client
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Assign Activity to {client.displayName}
          </h1>
          <p className="text-gray-400">Create a new activity assignment for your client.</p>
        </div>

        <div className="bg-surface-dark border border-primary/10 rounded-xl p-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-background-dark'
                    : 'bg-background-dark text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-icons text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content - Passing mode="assign" and targetUserId */}
          {activeTab === 'workout' && <WorkoutLogger mode="assign" targetUserId={clientId} />}
          {activeTab === 'hike' && <HikeLogger mode="assign" targetUserId={clientId} />}
          {activeTab === 'nutrition' && <NutritionLogger mode="assign" targetUserId={clientId} />}
          {activeTab === 'rest' && <RestDayLogger mode="assign" targetUserId={clientId} />}
        </div>
      </div>
    </DashboardLayout>
  )
}
