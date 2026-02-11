import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { WorkoutLogger } from '@/components/workouts/WorkoutLogger'
import { HikeLogger } from '@/components/hikes/HikeLogger'
import { NutritionLogger } from '@/components/nutrition/NutritionLogger'
import { RestDayLogger } from '@/components/restdays/RestDayLogger'
import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export function LogActivity() {
  const [activeTab, setActiveTab] = useState<'workout' | 'hike' | 'nutrition' | 'rest'>('workout')
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
