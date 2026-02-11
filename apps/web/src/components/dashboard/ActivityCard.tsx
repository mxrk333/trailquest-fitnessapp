import { useState } from 'react'
import { Workout, Hike } from '@repo/shared'
import { NutritionLog } from '@/services/firestore/nutrition'
import { RestDay } from '@/services/firestore/restDays'

interface ActivityCardProps {
  activity: Workout | Hike | NutritionLog | RestDay
  type: 'workout' | 'hike' | 'nutrition' | 'rest'
}

export function ActivityCard({ activity, type }: ActivityCardProps) {
  const [showDetails, setShowDetails] = useState(false)

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

  const getBgGradient = () => {
    switch (type) {
      case 'workout':
        return 'from-green-500/10 to-emerald-500/5'
      case 'hike':
        return 'from-orange-500/10 to-amber-500/5'
      case 'nutrition':
        return 'from-blue-500/10 to-cyan-500/5'
      case 'rest':
        return 'from-purple-500/10 to-pink-500/5'
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

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className={`bg-gradient-to-br ${getBgGradient()} border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] group cursor-pointer backdrop-blur-sm relative overflow-hidden`}
      >
        {/* Click indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-icons text-slate-400 text-sm">open_in_full</span>
        </div>

        {/* Glow effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}
        ></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="material-icons text-white text-xl">{getIcon()}</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors">
                  {getTitle()}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{date}</p>
              </div>
            </div>
          </div>

          {/* Content preview */}
          <div className="space-y-3">
            {type === 'workout' && (
              <div className="flex flex-wrap gap-2">
                {(activity as Workout).exercises.slice(0, 3).map((ex, i) => (
                  <span
                    key={i}
                    className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-white/10 text-slate-300 font-medium"
                  >
                    {ex.sets.length}× {ex.name}
                  </span>
                ))}
                {(activity as Workout).exercises.length > 3 && (
                  <span className="text-xs text-slate-500 flex items-center px-2">
                    +{(activity as Workout).exercises.length - 3} more
                  </span>
                )}
              </div>
            )}

            {type === 'hike' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Distance</p>
                  <p className="font-bold text-white text-sm">{(activity as Hike).distance}km</p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Elevation</p>
                  <p className="font-bold text-white text-sm">
                    {(activity as Hike).elevationGain}m
                  </p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Time</p>
                  <p className="font-bold text-white text-sm">{(activity as Hike).duration}m</p>
                </div>
              </div>
            )}

            {type === 'nutrition' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Calories</p>
                  <p className="font-bold text-white text-sm">
                    {(activity as NutritionLog).calories}
                  </p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Protein</p>
                  <p className="font-bold text-white text-sm">
                    {(activity as NutritionLog).protein}g
                  </p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Water</p>
                  <p className="font-bold text-white text-sm">
                    {(activity as NutritionLog).water}L
                  </p>
                </div>
              </div>
            )}

            {type === 'rest' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                {(activity as RestDay).type === 'active_recovery' &&
                (activity as RestDay).activities ? (
                  <div className="flex flex-wrap gap-2">
                    {(activity as RestDay).activities?.map((act, i) => (
                      <span
                        key={i}
                        className="bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-lg text-xs text-purple-300 font-medium"
                      >
                        {act}
                      </span>
                    ))}
                    {(activity as RestDay).duration && (
                      <span className="text-xs text-slate-400 flex items-center px-2">
                        {(activity as RestDay).duration}min
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="material-icons text-purple-400 text-base">bedtime</span>
                    Full rest day for recovery
                  </p>
                )}
              </div>
            )}
          </div>
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
                        <div
                          key={i}
                          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                        >
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
                                <span
                                  key={m}
                                  className="text-[10px] text-slate-500 uppercase tracking-wider font-bold px-2 py-1 bg-white/5 rounded"
                                >
                                  #{m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {type === 'hike' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Distance</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as Hike).distance}{' '}
                      <span className="text-lg text-slate-400">km</span>
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
                      Elevation Gain
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as Hike).elevationGain}{' '}
                      <span className="text-lg text-slate-400">m</span>
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Duration</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as Hike).duration}{' '}
                      <span className="text-lg text-slate-400">min</span>
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
                      Trail Name
                    </p>
                    <p className="text-lg font-bold text-white">
                      {(activity as Hike).trail || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {type === 'nutrition' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Calories</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).calories}
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Protein</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).protein}g
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Carbs</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).carbs}g
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Fats</p>
                    <p className="text-3xl font-bold text-white">
                      {(activity as NutritionLog).fats}g
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 col-span-2">
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
                  <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-slate-300">{activity.notes}</p>
                  </div>
                </div>
              )}

              {/* Edit button placeholder */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button className="flex-1 bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:scale-105 disabled:opacity-50">
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-icons text-lg">edit</span>
                    Edit Activity
                  </span>
                </button>
                <button className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 font-semibold rounded-xl transition-all">
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
