import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['trainee', 'hiker', 'trainer']),
  age: z.coerce.number().min(1, 'Age must be positive'),
  weight: z.coerce.number().min(1, 'Weight must be positive'),
  height: z.coerce.number().min(1, 'Height must be positive'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileSettings() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [trainerEmail, setTrainerEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || user?.displayName || '',
      role: (profile?.role as 'trainee' | 'hiker' | 'trainer') || 'trainee',
      age: profile?.age || 0,
      weight: profile?.weight || 0,
      height: profile?.height || 0,
    },
  })

  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return
    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: data.displayName,
        role: data.role,
        age: data.age,
        weight: data.weight,
        height: data.height,
      })
      alert('Profile updated successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Failed to update profile', error)
      alert('Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const onGrantAccess = async () => {
    if (!user || !trainerEmail) return

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        allowedTrainers: arrayUnion(trainerEmail),
      })
      alert(`Access granted to ${trainerEmail}`)
      setTrainerEmail('')
    } catch (error) {
      console.error('Failed to grant access', error)
      alert('Failed to grant access')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Main Profile Form */}
        <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-icons text-primary">person</span>
            </div>
            Personal Information
          </h2>
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  {...register('displayName')}
                  className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors.displayName && (
                  <p className="text-red-400 text-xs mt-2">{errors.displayName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
                <select
                  {...register('role')}
                  className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="trainee">Trainee (Gym Only)</option>
                  <option value="hiker">Hiker (Gym + Trail)</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Age</label>
                <input
                  type="number"
                  {...register('age')}
                  className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  {...register('weight')}
                  className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  {...register('height')}
                  className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Trainer Access Section */}
        <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="material-icons text-purple-400">supervisor_account</span>
            </div>
            Grant Trainer Access
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Allow a trainer to view your activity logs and progress.
          </p>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Trainer's Email"
              value={trainerEmail}
              onChange={e => setTrainerEmail(e.target.value)}
              className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <button
              onClick={onGrantAccess}
              className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              Grant Access
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
