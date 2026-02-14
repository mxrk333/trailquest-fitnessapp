import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { VolumeTrendChart } from '@/features/analytics/components/VolumeTrendChart'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { getRecentWorkouts } from '@/features/workouts/services/workouts'
import { getRecentHikes } from '@/features/hikes/services/hikes'
import { getTrainerClients } from '@/features/trainer/services/trainers'
import { useState, useEffect } from 'react'
import { User } from '@repo/shared'

export function AnalyticsPage() {
  const { user, profile } = useAuth()
  const [clients, setClients] = useState<User[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const isTrainer = profile?.role === 'trainer'

  // Load clients if user is a trainer
  useEffect(() => {
    async function loadClients() {
      if (!user || !isTrainer) return
      try {
        const clientList = await getTrainerClients(user.uid)
        setClients(clientList)
        // Auto-select first client
        if (clientList.length > 0 && !selectedClientId) {
          setSelectedClientId(clientList[0].uid)
        }
      } catch (error) {
        console.error('Failed to load clients:', error)
      }
    }
    loadClients()
  }, [user, isTrainer, selectedClientId])

  // Determine which user's data to show
  const targetUserId = isTrainer ? selectedClientId : user?.uid

  const { data: workouts = [] } = useQuery({
    queryKey: ['analytics-workouts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentWorkouts(targetUserId, 50)
    },
    enabled: !!targetUserId,
  })

  const { data: hikes = [] } = useQuery({
    queryKey: ['analytics-hikes', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentHikes(targetUserId, 50)
    },
    enabled: !!targetUserId,
  })

  // Calculate statistics
  const totalWorkouts = workouts.length
  const totalVolume = workouts.reduce((acc, w) => {
    return (
      acc +
      w.exercises.reduce((sum, ex) => {
        return (
          sum +
          ex.sets
            .filter(s => s.completed)
            .reduce((setSum, set) => setSum + set.weight * set.reps, 0)
        )
      }, 0)
    )
  }, 0)

  const totalElevation = hikes.reduce((acc, h) => acc + h.elevationGain, 0)
  const totalDistance = hikes.reduce((acc, h) => acc + h.distance, 0)

  // Progressive Overload Check (last 5 vs previous 5 workouts)
  const recentWorkouts = workouts.slice(0, 5)
  const previousWorkouts = workouts.slice(5, 10)

  const recentAvgVolume =
    recentWorkouts.reduce((acc, w) => {
      return (
        acc +
        w.exercises.reduce((sum, ex) => {
          return (
            sum +
            ex.sets
              .filter(s => s.completed)
              .reduce((setSum, set) => setSum + set.weight * set.reps, 0)
          )
        }, 0)
      )
    }, 0) / (recentWorkouts.length || 1)

  const previousAvgVolume =
    previousWorkouts.reduce((acc, w) => {
      return (
        acc +
        w.exercises.reduce((sum, ex) => {
          return (
            sum +
            ex.sets
              .filter(s => s.completed)
              .reduce((setSum, set) => setSum + set.weight * set.reps, 0)
          )
        }, 0)
      )
    }, 0) / (previousWorkouts.length || 1)

  const volumeChange = ((recentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100
  const isProgressing = volumeChange > 0

  // Get selected client name
  const selectedClient = clients.find(c => c.uid === selectedClientId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Analytics & Progress
              {isTrainer && selectedClient && (
                <span className="text-primary ml-2">- {selectedClient.displayName}</span>
              )}
            </h1>
            <p className="text-gray-400">
              {isTrainer
                ? "View client's progress and training data"
                : 'Track your strength progress and optimize your training'}
            </p>
          </div>

          {/* Client Selector for Trainers */}
          {isTrainer && clients.length > 0 && (
            <div className="min-w-[250px]">
              <label className="text-xs text-gray-400 uppercase mb-2 block">Select Client</label>
              <select
                value={selectedClientId || ''}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full bg-surface-dark border border-primary/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              >
                {clients.map(client => (
                  <option key={client.uid} value={client.uid}>
                    {client.displayName || client.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-primary/10 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Total Workouts</span>
              <span className="material-icons text-primary">fitness_center</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalWorkouts}</div>
            <div className="text-xs text-gray-500 mt-1">Logged sessions</div>
          </div>

          <div className="bg-surface-dark border border-primary/10 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Total Volume</span>
              <span className="material-icons text-orange-400">monitor_weight</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {totalVolume.toFixed(0)} <span className="text-lg text-gray-500">kg</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Weight lifted</div>
          </div>

          <div className="bg-surface-dark border border-primary/10 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Elevation Gain</span>
              <span className="material-icons text-blue-400">terrain</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {totalElevation.toFixed(0)} <span className="text-lg text-gray-500">m</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Climbed on trails</div>
          </div>

          <div className="bg-surface-dark border border-primary/10 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Total Distance</span>
              <span className="material-icons text-purple-400">hiking</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {totalDistance.toFixed(1)} <span className="text-lg text-gray-500">km</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Hiked</div>
          </div>
        </div>

        {/* Progressive Overload Indicator */}
        <div
          className={`bg-surface-dark border ${isProgressing ? 'border-primary/20' : 'border-orange-500/20'} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Progressive Overload</h3>
              <p className="text-sm text-gray-400">Comparing recent 5 workouts vs previous 5</p>
            </div>
            <div className={`text-right`}>
              <div
                className={`text-3xl font-bold ${isProgressing ? 'text-primary' : 'text-orange-400'}`}
              >
                {volumeChange > 0 ? '+' : ''}
                {volumeChange.toFixed(1)}%
              </div>
              <div
                className={`text-xs ${isProgressing ? 'text-primary' : 'text-orange-400'} flex items-center gap-1 justify-end mt-1`}
              >
                <span className="material-icons text-sm">
                  {isProgressing ? 'trending_up' : 'trending_flat'}
                </span>
                {isProgressing ? 'Great progress!' : 'Maintain volume'}
              </div>
            </div>
          </div>
        </div>

        {/* Training Load Chart */}
        <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">Training Load</h3>
            <p className="text-sm text-gray-400">Gym Volume & Hike Elevation</p>
          </div>
          <VolumeTrendChart userId={targetUserId || undefined} />
        </div>

        {/* Exercise Performance Table */}
        <div className="bg-surface-dark border border-primary/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20 border-b border-white/5">
                <tr className="text-xs uppercase text-gray-400">
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Activity</th>
                  <th className="text-right px-6 py-3">Volume/Distance</th>
                  <th className="text-right px-6 py-3">Exercises/Elevation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...workouts, ...hikes]
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .slice(0, 10)
                  .map((activity, idx) => {
                    const isWorkout = 'exercises' in activity
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {activity.timestamp.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`material-icons text-sm ${isWorkout ? 'text-primary' : 'text-blue-400'}`}
                            >
                              {isWorkout ? 'fitness_center' : 'hiking'}
                            </span>
                            <span className="text-white font-medium">
                              {isWorkout
                                ? (activity as any).name
                                : `Hike (${(activity as any).distance}km)`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-white font-bold">
                          {isWorkout
                            ? `${(activity as any).exercises
                                .reduce((sum: number, ex: any) => {
                                  return (
                                    sum +
                                    ex.sets
                                      .filter((s: any) => s.completed)
                                      .reduce(
                                        (setSum: number, set: any) =>
                                          setSum + set.weight * set.reps,
                                        0
                                      )
                                  )
                                }, 0)
                                .toFixed(0)} kg`
                            : `${(activity as any).distance} km`}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-sm">
                          {isWorkout
                            ? `${(activity as any).exercises.length} exercises`
                            : `${(activity as any).elevationGain}m gain`}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
