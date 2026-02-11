import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { saveHike } from '@/services/firestore/hikes'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

const hikeFormSchema = z.object({
  distance: z.coerce.number().min(0.1, 'Distance must be greater than 0'),
  elevationGain: z.coerce.number().min(0, 'Elevation gain must be positive'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  notes: z.string().optional(),
})

type HikeFormValues = z.infer<typeof hikeFormSchema>

export function HikeLogger() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeMuscles, setActiveMuscles] = useState<string[]>(['calves', 'quads'])
  const [difficulty, setDifficulty] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HikeFormValues>({
    resolver: zodResolver(hikeFormSchema),
  })

  // Watch fields for calculations
  const elevationGain = watch('elevationGain')
  const distance = watch('distance')

  // Calculate muscle contribution & difficulty
  useEffect(() => {
    // elevationGain and distance are now numbers due to coerce, or NaN if empty/invalid
    // But watch returns the raw input value string usually if connected to input?
    // Wait, zodResolver handles validation but watch returns form state.
    // If inputs are type="number", value is usually string.
    const elevation = Number(elevationGain) || 0
    const dist = Number(distance) || 0

    // Muscles
    const muscles = ['calves', 'quads', 'hamstrings']
    if (elevation > 500) muscles.push('glutes')
    if (elevation > 1500) {
      muscles.push('lower_back')
      muscles.push('core')
    }
    setActiveMuscles([...new Set(muscles)])

    // Difficulty (Simplified logic)
    let diff = 0
    if (dist > 0) {
      diff = dist * 2 + elevation / 100
    }
    setDifficulty(Math.min(diff, 100)) // Cap at 100
  }, [elevationGain, distance])

  const onSubmit = async (data: HikeFormValues) => {
    if (!user) return

    setLoading(true)
    try {
      console.log('Saving hike data:', { ...data, activeMuscles })
      await saveHike({
        userId: user.uid,
        timestamp: new Date(),
        distance: data.distance,
        elevationGain: data.elevationGain,
        duration: data.duration,
        activeMuscles: activeMuscles,
        notes: data.notes || undefined,
      })
      navigate('/')
    } catch (error: unknown) {
      console.error('Failed to save hike', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to save hike: ${message}. Check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Input Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Hike Details Card */}
        <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-primary/10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-icons text-primary">hiking</span> Hike Details
          </h2>

          <form
            id="hike-form"
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Trail Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-gray-500 text-lg">search</span>
                </span>
                <input
                  type="text"
                  placeholder="Search saved trails or name a new one..."
                  className="w-full pl-10 bg-gray-50 dark:bg-surface-darker border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Distance
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  {...register('distance')}
                  className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-gray-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 text-sm font-medium">
                  km
                </span>
              </div>
              {errors.distance && (
                <p className="text-red-500 text-xs mt-1">{errors.distance.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Duration (mins)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="90"
                  {...register('duration')}
                  className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-gray-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 text-sm font-medium">
                  min
                </span>
              </div>
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Elevation Gain
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  {...register('elevationGain')}
                  className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-gray-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 text-sm font-medium">
                  m
                </span>
              </div>
              {errors.elevationGain && (
                <p className="text-red-500 text-xs mt-1">{errors.elevationGain.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Pack Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-gray-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 text-sm font-medium">
                  kg
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Trail Notes
              </label>
              <textarea
                placeholder="Muddy conditions on the north face..."
                {...register('notes')}
                className="w-full bg-gray-50 dark:bg-surface-darker border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none min-h-[100px]"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Map Upload Placeholder */}
      </div>

      {/* Right Column: Summary & Save */}
      <div className="lg:col-span-1 space-y-6">
        {/* Dynamic Summary Card */}
        <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-primary/10 sticky top-24">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
            Session Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-300">Est. Pace</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                -- <span className="text-sm text-gray-500 font-medium">min/km</span>
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-300">Calories</span>
              <span className="text-2xl font-bold text-primary">
                ~{Math.round(difficulty * 10)}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-500 mb-3 block">
                DIFFICULTY RATING
              </span>
              <div className="flex items-center gap-1">
                <div className="h-2 w-full rounded bg-surface-darker overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-yellow-400 transition-all duration-500"
                    style={{ width: `${Math.min(difficulty, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {Math.round(difficulty)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Fill in distance & elevation to calculate.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              form="hike-form"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-green-400 text-background-dark font-bold py-3.5 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Save Activity Log'
              )}
            </button>
            <button className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-primary/10 text-gray-600 dark:text-gray-400 font-semibold py-3 px-6 rounded-lg border border-gray-300 dark:border-primary/20 transition-all">
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
