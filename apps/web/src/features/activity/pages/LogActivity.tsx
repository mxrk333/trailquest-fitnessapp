import { useState } from 'react'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { WorkoutLogger } from '@/features/workouts/components/WorkoutLogger'
import { HikeLogger } from '@/features/hikes/components/HikeLogger'
import { NutritionLogger } from '@/features/nutrition/components/NutritionLogger'
import { RestDayLogger } from '@/features/rest-days/components/RestDayLogger'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/providers/AuthProvider'

export function LogActivity() {
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') as 'workout' | 'hike' | 'nutrition' | 'rest' | null

  const [activeTab, setActiveTab] = useState<'workout' | 'hike' | 'nutrition' | 'rest'>(
    initialType === 'hike' || initialType === 'nutrition' || initialType === 'rest'
      ? initialType
      : 'workout'
  )
  const { profile } = useAuth()

  const canAccessHikes = profile?.role === 'hiker' || profile?.role === 'trainer'

  const tabs = [
    { id: 'workout' as const, label: 'Gym Workout', icon: 'fitness_center' },
    ...(canAccessHikes ? [{ id: 'hike' as const, label: 'Trail Hike', icon: 'hiking' }] : []),
    { id: 'nutrition' as const, label: 'Nutrition', icon: 'restaurant' },
    { id: 'rest' as const, label: 'Rest Day', icon: 'hotel' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Log Activity</h1>
          <p className="text-gray-400">Track your workouts, hikes, nutrition, and recovery</p>
        </div>

        <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-white border border-primary/40 shadow-lg shadow-primary/10'
                    : 'bg-surface-dark/50 text-gray-400 hover:text-gray-200 hover:bg-surface-dark border border-white/5 hover:border-primary/20'
                }`}
              >
                <span className="material-icons text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'workout' && <WorkoutLogger />}
          {activeTab === 'hike' && <HikeLogger />}
          {activeTab === 'nutrition' && <NutritionLogger />}
          {activeTab === 'rest' && <RestDayLogger />}
        </div>
      </div>
    </DashboardLayout>
  )
}
