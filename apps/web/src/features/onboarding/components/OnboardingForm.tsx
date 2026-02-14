import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/providers/AuthProvider'
import {
  completeOnboarding,
  createGoogleUserProfile,
} from '@/features/auth/services/auth.service'

const SPECIALIZATION_OPTIONS = [
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio & Endurance' },
  { value: 'hiking_outdoor', label: 'Hiking & Outdoor' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'sports_performance', label: 'Sports Performance' },
  { value: 'general_fitness', label: 'General Fitness' },
] as const

const onboardingSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    age: z.coerce.number().min(13, 'Must be at least 13').max(120, 'Invalid age'),
    weight: z.coerce.number().min(20, 'Must be at least 20 kg').max(300, 'Invalid weight'),
    height: z.coerce.number().min(100, 'Must be at least 100 cm').max(250, 'Invalid height'),
    role: z.enum(['trainee', 'hiker', 'trainer']).optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    fitnessGoal: z.string().max(200, 'Keep it under 200 characters').optional(),
    certifications: z.string().optional(),
    specialization: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'trainer') {
      if (!data.certifications || data.certifications.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter your certifications',
          path: ['certifications'],
        })
      }
      if (!data.specialization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select your specialization',
          path: ['specialization'],
        })
      }
    }
    if (data.role === 'trainee' || data.role === 'hiker') {
      if (!data.experienceLevel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select your experience level',
          path: ['experienceLevel'],
        })
      }
    }
  })

type OnboardingFormValues = z.infer<typeof onboardingSchema>

export function OnboardingForm() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const needsRole = !profile?.role
  const currentRole = profile?.role

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: profile?.displayName || user?.displayName || '',
      role: currentRole as OnboardingFormValues['role'],
    },
  })

  const selectedRole = watch('role') || currentRole

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const effectiveRole = data.role || currentRole

      // For Google auth users without a Firestore profile
      if (!profile) {
        if (!effectiveRole) {
          setError('Please select a role')
          setLoading(false)
          return
        }
        await createGoogleUserProfile(user, effectiveRole)
      }

      // Build onboarding data based on role
      const onboardingData: Record<string, unknown> = {
        displayName: data.displayName,
        age: data.age,
        weight: data.weight,
        height: data.height,
      }

      if (effectiveRole === 'trainer') {
        onboardingData.certifications = data.certifications
        onboardingData.specialization = data.specialization
      } else {
        onboardingData.experienceLevel = data.experienceLevel
        if (data.fitnessGoal) {
          onboardingData.fitnessGoal = data.fitnessGoal
        }
      }

      await completeOnboarding(user.uid, onboardingData)
      await refreshProfile()
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role Selection — only for Google auth users without a profile */}
      {needsRole && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 mb-3">
            I am a:
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="cursor-pointer group">
              <input type="radio" value="trainee" {...register('role')} className="peer sr-only" />
              <div className="flex flex-col items-center justify-center p-3 border border-white/10 rounded-xl bg-input-bg hover:bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow peer-checked:shadow-primary/20">
                <span className="material-icons text-gray-500 group-hover:text-primary peer-checked:text-primary mb-1">
                  fitness_center
                </span>
                <span className="text-xs font-semibold text-gray-400 peer-checked:text-white">
                  Trainee
                </span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input type="radio" value="hiker" {...register('role')} className="peer sr-only" />
              <div className="flex flex-col items-center justify-center p-3 border border-white/10 rounded-xl bg-input-bg hover:bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow peer-checked:shadow-primary/20">
                <span className="material-icons text-gray-500 group-hover:text-primary peer-checked:text-primary mb-1">
                  hiking
                </span>
                <span className="text-xs font-semibold text-gray-400 peer-checked:text-white">
                  Hiker
                </span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input type="radio" value="trainer" {...register('role')} className="peer sr-only" />
              <div className="flex flex-col items-center justify-center p-3 border border-white/10 rounded-xl bg-input-bg hover:bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow peer-checked:shadow-primary/20">
                <span className="material-icons text-gray-500 group-hover:text-primary peer-checked:text-primary mb-1">
                  timer
                </span>
                <span className="text-xs font-semibold text-gray-400 peer-checked:text-white">
                  Trainer
                </span>
              </div>
            </label>
          </div>
          {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
        </div>
      )}

      {/* Display Name */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
          htmlFor="displayName"
        >
          Full Name
        </label>
        <div className="relative group mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
              person
            </span>
          </div>
          <input
            id="displayName"
            type="text"
            placeholder="Alex Venture"
            disabled={loading}
            className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
            {...register('displayName')}
          />
        </div>
        {errors.displayName && (
          <p className="text-sm text-red-500 mt-1">{errors.displayName.message}</p>
        )}
      </div>

      {/* Physical Stats */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 mb-2">
          Physical Stats
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              className="block text-xs text-gray-500 ml-1"
              htmlFor="age"
            >
              Age
            </label>
            <input
              id="age"
              type="number"
              placeholder="25"
              disabled={loading}
              className="mt-1 block w-full px-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('age')}
            />
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label
              className="block text-xs text-gray-500 ml-1"
              htmlFor="weight"
            >
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              placeholder="75"
              disabled={loading}
              className="mt-1 block w-full px-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('weight')}
            />
            {errors.weight && (
              <p className="text-xs text-red-500 mt-1">{errors.weight.message}</p>
            )}
          </div>
          <div>
            <label
              className="block text-xs text-gray-500 ml-1"
              htmlFor="height"
            >
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              placeholder="180"
              disabled={loading}
              className="mt-1 block w-full px-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm"
              {...register('height')}
            />
            {errors.height && (
              <p className="text-xs text-red-500 mt-1">{errors.height.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Trainee/Hiker Fields */}
      {(selectedRole === 'trainee' || selectedRole === 'hiker') && (
        <div className="space-y-4">
          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 mb-3">
              <span className="material-icons text-primary text-sm align-middle mr-1">
                trending_up
              </span>
              Fitness Profile
            </label>
          </div>

          {/* Experience Level */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="experienceLevel"
            >
              Experience Level
            </label>
            <div className="relative group mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                  signal_cellular_alt
                </span>
              </div>
              <select
                id="experienceLevel"
                disabled={loading}
                className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm appearance-none"
                {...register('experienceLevel')}
              >
                <option value="" className="bg-surface-dark">Select your level</option>
                <option value="beginner" className="bg-surface-dark">Beginner</option>
                <option value="intermediate" className="bg-surface-dark">Intermediate</option>
                <option value="advanced" className="bg-surface-dark">Advanced</option>
              </select>
            </div>
            {errors.experienceLevel && (
              <p className="text-sm text-red-500 mt-1">{errors.experienceLevel.message}</p>
            )}
          </div>

          {/* Fitness Goal */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="fitnessGoal"
            >
              Fitness Goal <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <div className="relative group mt-1">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                  flag
                </span>
              </div>
              <textarea
                id="fitnessGoal"
                placeholder="e.g. Complete a 50k hike, lose 10kg, build muscle..."
                disabled={loading}
                rows={2}
                className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm resize-none"
                {...register('fitnessGoal')}
              />
            </div>
            {errors.fitnessGoal && (
              <p className="text-sm text-red-500 mt-1">{errors.fitnessGoal.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Trainer Fields */}
      {selectedRole === 'trainer' && (
        <div className="space-y-4">
          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 mb-3">
              <span className="material-icons text-primary text-sm align-middle mr-1">
                verified
              </span>
              Trainer Credentials
            </label>
          </div>

          {/* Certifications */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="certifications"
            >
              Certifications & Credentials
            </label>
            <div className="relative group mt-1">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                  workspace_premium
                </span>
              </div>
              <textarea
                id="certifications"
                placeholder="e.g. NASM CPT, ACE Certified Personal Trainer, CSCS..."
                disabled={loading}
                rows={3}
                className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm resize-none"
                {...register('certifications')}
              />
            </div>
            {errors.certifications && (
              <p className="text-sm text-red-500 mt-1">{errors.certifications.message}</p>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1"
              htmlFor="specialization"
            >
              Area of Specialization
            </label>
            <div className="relative group mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-500 group-focus-within:text-primary transition-colors text-xl">
                  star
                </span>
              </div>
              <select
                id="specialization"
                disabled={loading}
                className="block w-full pl-10 pr-3 py-3 bg-surface-dark/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm appearance-none"
                {...register('specialization')}
              >
                <option value="" className="bg-surface-dark">Select your specialization</option>
                {SPECIALIZATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-surface-dark">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.specialization && (
              <p className="text-sm text-red-500 mt-1">{errors.specialization.message}</p>
            )}
          </div>

          <p className="text-xs text-gray-500 ml-1">
            Your credentials will be reviewed by an admin before your trainer account is activated.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded text-center">{error}</p>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-dark transition-all transform active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="mr-2 h-4 w-4 animate-spin border-2 border-background-dark border-t-transparent rounded-full" />
          ) : (
            <>
              Complete Setup
              <span className="material-icons text-base ml-1">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
