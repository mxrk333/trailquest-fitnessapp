import { useState } from 'react'
import { Workout, Hike } from '@repo/shared'
import { NutritionLog } from '@/features/nutrition/services/nutrition'
import { RestDay } from '@/features/rest-days/services/restDays'
import { deleteWorkout } from '@/features/workouts/services/workouts'
import { deleteHike } from '@/features/hikes/services/hikes'
import { deleteNutritionLog } from '@/features/nutrition/services/nutrition'
import { deleteRestDay } from '@/features/rest-days/services/restDays'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Badge, Button } from '@repo/ui'

interface ActivityCardProps {
  activity: Workout | Hike | NutritionLog | RestDay
  type: 'workout' | 'hike' | 'nutrition' | 'rest'
}

export function ActivityCard({ activity, type }: ActivityCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyActivity = activity as any

  const date = new Date(activity.timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const getIcon = () => {
    switch (type) {
      case 'workout':
        return 'fitness_center'
      case 'hike':
        return 'hiking'
      case 'nutrition':
        return 'restaurant'
      case 'rest':
        return 'hotel'
    }
  }

  const getGradient = () => {
    switch (type) {
      case 'workout':
        return 'from-green-500 to-emerald-400'
      case 'hike':
        return 'from-orange-500 to-amber-400'
      case 'nutrition':
        return 'from-blue-500 to-cyan-400'
      case 'rest':
        return 'from-purple-500 to-pink-400'
    }
  }

  const getAccentColor = () => {
    switch (type) {
      case 'workout':
        return 'text-green-400'
      case 'hike':
        return 'text-orange-400'
      case 'nutrition':
        return 'text-blue-400'
      case 'rest':
        return 'text-purple-400'
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'workout':
        return 'border-green-500/20 hover:border-green-500/40'
      case 'hike':
        return 'border-orange-500/20 hover:border-orange-500/40'
      case 'nutrition':
        return 'border-blue-500/20 hover:border-blue-500/40'
      case 'rest':
        return 'border-purple-500/20 hover:border-purple-500/40'
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'workout':
        return (activity as Workout).name || 'Gym Session'
      case 'hike':
        return 'Trail Hike'
      case 'nutrition':
        return (
          (activity as NutritionLog).mealType.charAt(0).toUpperCase() +
          (activity as NutritionLog).mealType.slice(1)
        )
      case 'rest':
        return (activity as RestDay).type === 'complete_rest' ? 'Complete Rest' : 'Active Recovery'
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity? This cannot be undone.')) return

    setIsDeleting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = anyActivity.id
      if (!id) {
        alert('Activity ID not found')
        return
      }

      if (type === 'workout') {
        await deleteWorkout(id)
        queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })
        queryClient.invalidateQueries({ queryKey: ['workouts-for-volume'] })
      } else if (type === 'hike') {
        await deleteHike(id)
        queryClient.invalidateQueries({ queryKey: ['analytics-hikes'] })
        queryClient.invalidateQueries({ queryKey: ['recent-hikes'] })
      } else if (type === 'nutrition') {
        await deleteNutritionLog(id)
        queryClient.invalidateQueries({ queryKey: ['recent-nutrition'] })
        queryClient.invalidateQueries({ queryKey: ['nutrition-today'] })
      } else if (type === 'rest') {
        await deleteRestDay(id)
        queryClient.invalidateQueries({ queryKey: ['recent-rest-days'] })
      }
      setShowDetails(false)
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Failed to delete activity')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = anyActivity.id
    if (!id) return

    if (type === 'workout') {
      navigate(`/log-activity?type=workout&id=${id}`)
    } else if (type === 'hike') {
      navigate(`/log-activity?type=hike&id=${id}`)
    } else if (type === 'nutrition') {
      navigate(`/log-activity?type=nutrition&id=${id}`)
    } else if (type === 'rest') {
      navigate(`/log-activity?type=rest&id=${id}`)
    }
  }

  const canEdit = true // All activity types now support editing

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className={`bg-surface-dark/80 border ${getBorderColor()} rounded-2xl p-5 transition-all duration-300 hover:shadow-lg group cursor-pointer backdrop-blur-sm`}
      >
        {/* Single-level flat layout: icon | content | meta */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}
          >
            <span className="material-icons text-white text-lg">{getIcon()}</span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm group-hover:text-primary transition-colors truncate">
                {getTitle()}
              </h3>
              {/* Status Badge */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {anyActivity.status && anyActivity.status !== 'completed' && (
                <Badge
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    anyActivity.status === 'partial'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : anyActivity.status === 'pending'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {anyActivity.status === 'partial'
                    ? 'Partial'
                    : anyActivity.status === 'pending'
                      ? 'Pending'
                      : 'Missed'}
                </Badge>
              )}
            </div>

            {/* Inline stats — flat, no nested boxes */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-icons text-slate-600 text-[14px]">schedule</span>
                {date}
              </span>

              {type === 'workout' && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as Workout).exercises.length} exercises</span>
                  <span className="text-slate-700">·</span>
                  <span className="flex flex-wrap gap-1">
                    {(activity as Workout).exercises.slice(0, 2).map((ex, i) => (
                      <span key={i} className={getAccentColor()}>
                        {ex.name}
                        {i < Math.min((activity as Workout).exercises.length, 2) - 1 ? ',' : ''}
                      </span>
                    ))}
                    {(activity as Workout).exercises.length > 2 && (
                      <span className="text-slate-500">
                        +{(activity as Workout).exercises.length - 2}
                      </span>
                    )}
                  </span>
                </>
              )}

              {type === 'hike' && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as Hike).distance}km</span>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as Hike).elevationGain}m elev</span>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as Hike).duration}min</span>
                </>
              )}

              {type === 'nutrition' && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as NutritionLog).calories} cal</span>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as NutritionLog).protein}g protein</span>
                  <span className="text-slate-700">·</span>
                  <span>{(activity as NutritionLog).water}L water</span>
                </>
              )}

              {type === 'rest' && (
                <>
                  {(activity as RestDay).type === 'active_recovery' &&
                    (activity as RestDay).activities && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span>{(activity as RestDay).activities?.join(', ')}</span>
                      </>
                    )}
                  {(activity as RestDay).type === 'complete_rest' && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className="text-purple-400">Full rest day</span>
                    </>
                  )}
                  {(activity as RestDay).duration && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span>{(activity as RestDay).duration}min</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Expand indicator */}
          <span className="material-icons text-slate-600 group-hover:text-slate-400 text-lg transition-colors shrink-0">
            chevron_right
          </span>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/90 border border-primary/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center shadow-lg`}
                >
                  <span className="material-icons text-white text-2xl">{getIcon()}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
                  <p className="text-sm text-slate-400 mt-1">{date}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <span className="material-icons text-slate-400">close</span>
              </button>
            </div>

            {/* Full Details */}
            <div className="space-y-6">
              {type === 'workout' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Exercises
                    </h3>
                    <div className="space-y-3">
                      {(activity as Workout).exercises.map((ex, i) => (
                        <div key={i} className="border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white">{ex.name}</h4>
                            <span className="text-xs text-slate-500">{ex.sets.length} sets</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {ex.sets.map((set, j) => (
                              <div key={j} className="bg-white/5 rounded-lg p-2 text-center">
                                <p className="text-xs text-slate-500">Set {j + 1}</p>
                                <p className="text-sm font-bold text-white">
                                  {set.reps} × {set.weight}kg
                                </p>
                              </div>
                            ))}
                          </div>
                          {ex.muscles && ex.muscles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {ex.muscles.map(m => (
                                <Badge
                                  key={m}
                                  className="text-[10px] text-slate-500 uppercase tracking-wider font-bold px-2 py-1 bg-white/5 rounded border-none hover:bg-white/10"
                                >
                                  #{m}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ... (Hike and Nutrition and Rest types remain largely same except using Badge if needed, but they mostly use P tags) */}
              {/* Copy logic for hike/nutrition/rest visualization - assuming no Buttons/Badges inside them except maybe tags */}

              {type === 'hike' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Distance</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as Hike).distance}{' '}
                      <span className="text-lg text-slate-400">km</span>
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
                      Elevation Gain
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as Hike).elevationGain}{' '}
                      <span className="text-lg text-slate-400">m</span>
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Duration</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as Hike).duration}{' '}
                      <span className="text-lg text-slate-400">min</span>
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Mountain</p>
                    <p className="text-lg font-bold text-white">
                      {(activity as Hike).mountain || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {type === 'nutrition' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Calories</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).calories}
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Protein</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).protein}g
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Carbs</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).carbs}g
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Fats</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).fats}g
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4 col-span-2">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
                      Water Intake
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).water}L
                    </p>
                  </div>
                </div>
              )}

              {activity.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Notes
                  </h3>
                  <div className="border border-white/10 rounded-xl p-4">
                    <p className="text-slate-300">{activity.notes}</p>
                  </div>
                </div>
              )}

              {/* Edit/Delete buttons */}
              {canEdit && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    onClick={handleEdit}
                    className="flex-1 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark font-bold py-6 rounded-xl shadow-lg shadow-primary/30 hover:scale-105 disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-icons text-lg">edit</span>
                      Edit Activity
                    </span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-6 py-6 border-red-500/30 text-red-400 hover:bg-red-500/30 font-semibold rounded-xl bg-red-500/20"
                  >
                    <span className="material-icons">
                      {isDeleting ? 'hourglass_empty' : 'delete'}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
