import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { doc, setDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Button, Label, Card } from '@repo/ui'
import { UserRoleSchema, FitnessLevelSchema } from '@repo/shared/schemas'

const onboardingSchema = z.object({
  role: UserRoleSchema,
  fitnessLevel: FitnessLevelSchema,
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

export function Onboarding() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: 'trainee',
      fitnessLevel: 'beginner',
    },
  })

  const selectedRole = watch('role')
  const selectedLevel = watch('fitnessLevel')

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!auth.currentUser) return

    setLoading(true)
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        role: data.role,
        fitnessLevel: data.fitnessLevel,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      navigate('/')
    } catch (error) {
      console.error('Error saving user data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-8 bg-gray-900 border-gray-800">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Welcome to TrailQuest
            </h1>
            <p className="text-gray-400 mt-2">Let's set up your profile</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <input type="hidden" {...register('role')} />
              <input type="hidden" {...register('fitnessLevel')} />
              <Label className="text-lg">I am a...</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setValue('role', 'trainee')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'trainee'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-bold">Trainee</h3>
                  <p className="text-sm text-gray-400">I want to track my workouts and progress</p>
                </div>
                <div
                  onClick={() => setValue('role', 'trainer')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'trainer'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-bold">Trainer</h3>
                  <p className="text-sm text-gray-400">I want to manage clients and plans</p>
                </div>
              </div>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>

            <div className="space-y-4">
              <Label className="text-lg">Fitness Level</Label>
              <div className="grid grid-cols-3 gap-4">
                {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                  <div
                    key={level}
                    onClick={() => setValue('fitnessLevel', level)}
                    className={`cursor-pointer p-3 rounded-lg border-2 text-center capitalize transition-all ${
                      selectedLevel === level
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {level}
                  </div>
                ))}
              </div>
              {errors.fitnessLevel && (
                <p className="text-red-500 text-sm">{errors.fitnessLevel.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
