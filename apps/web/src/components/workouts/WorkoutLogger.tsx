import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { saveWorkout, getWorkoutById, updateWorkout } from '@/services/firestore/workouts'
import { ExerciseRow } from './ExerciseRow'
import { Exercise } from '@repo/shared'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

interface WorkoutLoggerProps {
  mode?: 'log' | 'assign'
  targetUserId?: string
}

export function WorkoutLogger({ mode = 'log', targetUserId }: WorkoutLoggerProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [loading, setLoading] = useState(false)

  const [workoutName, setWorkoutName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16)) // Format for datetime-local

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      name: '',
      muscles: [],
      sets: [{ setNumber: 1, weight: 0, reps: 0, rpe: 0, completed: false }],
    },
  ])

  // Fetch workout data if editing
  const { data: editWorkout, isLoading: isLoadingWorkout } = useQuery({
    queryKey: ['workout', editId],
    queryFn: async () => {
      if (!editId) return null
      return await getWorkoutById(editId)
    },
    enabled: !!editId,
  })

  // Populate form when data arrives
  useEffect(() => {
    if (editWorkout) {
      setWorkoutName(editWorkout.name || '')
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      const d = new Date(editWorkout.timestamp)
      const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDate(formattedDate)

      if (editWorkout.exercises && editWorkout.exercises.length > 0) {
        setExercises(editWorkout.exercises)
      }
    }
  }, [editWorkout])

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: [{ setNumber: 1, weight: 0, reps: 0, rpe: 0, completed: false }],
        muscles: [],
      },
    ])
  }

  const handleUpdateExercise = (index: number, updatedExercise: Exercise) => {
    const newExercises = [...exercises]
    newExercises[index] = updatedExercise
    setExercises(newExercises)
  }

  const handleRemoveExercise = (index: number) => {
    // if (exercises.length === 1) return
    const newExercises = exercises.filter((_, i) => i !== index)
    setExercises(newExercises)
  }

  // Calculate workout status based on completed sets
  const calculateWorkoutStatus = (exercises: Exercise[]): 'completed' | 'partial' | 'skipped' => {
    const validExercises = exercises.filter(ex => ex.name.trim() !== '')
    if (validExercises.length === 0) return 'skipped'

    let totalSets = 0
    let completedSets = 0

    validExercises.forEach(ex => {
      ex.sets.forEach(set => {
        totalSets++
        if (set.completed) completedSets++
      })
    })

    if (completedSets === 0) return 'skipped'
    if (completedSets === totalSets) return 'completed'
    return 'partial'
  }

  const handleSave = async () => {
    if (!user) return

    // Simple validation
    const validExercises = exercises.filter(ex => ex.name.trim() !== '')
    if (validExercises.length === 0) {
      alert('Please add at least one exercise.')
      return
    }

    setLoading(true)
    try {
      const workoutData = {
        userId: targetUserId || user.uid,
        timestamp: new Date(date),
        name: workoutName,
        exercises: validExercises,
        isRestDay: false,
        status: (mode === 'assign' ? 'pending' : 'completed') as 'pending' | 'completed' | 'missed',
        ...(mode === 'assign'
          ? { assignedBy: user.uid }
          : editWorkout?.assignedBy
            ? { assignedBy: editWorkout.assignedBy }
            : {}),
      }
      if (editId) {
        await updateWorkout(editId, workoutData)
        console.log('✅ Workout updated as', stats.status)
      } else {
        await saveWorkout(workoutData)
        console.log('✅ Workout saved as', stats.status)
      }
      navigate('/') // Redirect to dashboard
    } catch (error) {
      console.error('Failed to save workout', error)
      alert('Failed to save workout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    let totalVolume = 0
    let setsCompleted = 0
    let totalSets = 0
    const muscleCounts: Record<string, number> = {}

    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        totalSets++
        if (set.completed) {
          totalVolume += set.weight * set.reps
          setsCompleted++
        }
      })

      // Weight per exercise contribution to muscle load
      // Simplified: each exercise adds 1 point to its muscles
      ex.muscles?.forEach(m => {
        muscleCounts[m] = (muscleCounts[m] || 0) + 1
      })
    })

    // Normalize muscle load for visualization
    const totalMusclePoints = Object.values(muscleCounts).reduce((a, b) => a + b, 0) || 1
    const muscleLoad = Object.entries(muscleCounts)
      .map(([name, count]) => ({ name, percentage: Math.round((count / totalMusclePoints) * 100) }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)

    // Calculate status
    const validExercises = exercises.filter(ex => ex.name.trim() !== '')
    let status: 'completed' | 'partial' | 'skipped' = 'skipped'
    if (setsCompleted === 0 && validExercises.length > 0) status = 'skipped'
    else if (setsCompleted === totalSets && totalSets > 0) status = 'completed'
    else if (setsCompleted > 0) status = 'partial'

    return { totalVolume, setsCompleted, totalSets, muscleLoad, status }
  }, [exercises])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Input Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Workout Header Card */}
        <div className="bg-surface-dark/80 rounded-xl p-6 shadow-sm border border-primary/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Workout Name
              </label>
              <input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder="e.g. Leg Day"
                className="w-full bg-surface-darker border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-surface-darker border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Exercises List */}
        {exercises.map((ex, index) => (
          <ExerciseRow
            key={index}
            index={index}
            exercise={ex}
            onUpdate={handleUpdateExercise}
            onRemove={handleRemoveExercise}
          />
        ))}

        {/* Add Exercise Button */}
        <button
          onClick={handleAddExercise}
          className="w-full border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group h-32"
        >
          <div className="h-10 w-10 rounded-full bg-surface-darker group-hover:bg-primary/20 flex items-center justify-center transition-colors">
            <span className="material-icons text-2xl group-hover:text-primary transition-colors">
              add
            </span>
          </div>
          <span className="font-medium">Add Exercise</span>
        </button>
      </div>

      {/* Right Column: Summary & Save */}
      <div className="lg:col-span-1 space-y-6">
        {/* Dynamic Summary Card */}
        <div className="bg-surface-dark/80 rounded-xl p-6 shadow-sm border border-primary/20 sticky top-24">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">
            Session Summary
          </h3>

          {/* Status Badge */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-300">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                stats.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : stats.status === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {stats.status === 'completed'
                ? '✓ Complete'
                : stats.status === 'partial'
                  ? '⚠ Partial'
                  : '— Empty'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-300">Total Volume</span>
              <span className="text-2xl font-bold text-white">
                {stats.totalVolume.toLocaleString()}{' '}
                <span className="text-sm text-gray-500 font-medium">kg</span>
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-300">Sets Progress</span>
              <span className="text-2xl font-bold text-white">
                {stats.setsCompleted} / {stats.totalSets}
              </span>
            </div>

            {/* Muscle Heatmap Viz */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-500 mb-3 block">MUSCLE LOAD</span>
              <div className="flex gap-2 flex-wrap">
                {stats.muscleLoad.map(m => (
                  <span
                    key={m.name}
                    className="px-3 py-1 bg-primary/20 text-white rounded-full text-xs font-bold capitalize"
                  >
                    {m.name} {m.percentage}%
                  </span>
                ))}
              </div>
              <div className="mt-4 h-2 w-full bg-surface-darker rounded-full overflow-hidden flex">
                {stats.muscleLoad.map((m, i) => (
                  <div
                    key={m.name}
                    className={`h-full ${i === 0 ? 'bg-primary' : 'bg-primary/50'}`}
                    style={{ width: `${m.percentage}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-primary hover:bg-green-400 text-background-dark font-bold py-3.5 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
              ) : editId ? (
                `Update as ${stats.status === 'completed' ? 'Complete' : stats.status === 'partial' ? 'Partial' : 'Empty'}`
              ) : (
                `Save as ${stats.status === 'completed' ? 'Complete' : stats.status === 'partial' ? 'Partial' : 'Empty'}`
              )}
            </button>
            <p className="text-xs text-gray-500 text-center">
              {stats.status === 'partial' && '💡 You can continue this workout later'}
              {stats.status === 'completed' && '✅ All sets completed!'}
              {stats.status === 'skipped' && 'ℹ️ Mark at least one set as complete'}
            </p>
          </div>
        </div>

        {/* Pro Tip Card */}
        <div className="bg-gradient-to-br from-surface-dark to-surface-darker rounded-xl p-5 border border-primary/10">
          <div className="flex items-start gap-3">
            <span className="material-icons text-primary mt-1">lightbulb</span>
            <div>
              <h4 className="text-sm font-bold text-white">Coach's Tip</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Don't forget to tag your RPE accurately. An RPE of 7 means you could have done 3
                more reps with good form.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
