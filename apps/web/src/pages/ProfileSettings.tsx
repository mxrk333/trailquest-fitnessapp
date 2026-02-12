import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { doc, updateDoc, deleteField, arrayRemove } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
// DISABLED: Photo upload imports (Firebase Storage not enabled)
// Uncomment when Storage is enabled:
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
// import { db, storage } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { getAllTrainers, getTrainerClients } from '@/services/firestore/trainers'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['trainee', 'hiker', 'trainer']),
  age: z.coerce.number().min(1, 'Age must be positive'),
  weight: z.coerce.number().min(1, 'Weight must be positive'),
  height: z.coerce.number().min(1, 'Height must be positive'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
// const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedTrainerId, setSelectedTrainerId] = useState('')

  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery({
    queryKey: ['trainers'],
    queryFn: getAllTrainers,
  })

  // Fetch assigned trainer info if trainee has a trainerId
  const { data: assignedTrainer, isLoading: isLoadingAssignedTrainer } = useQuery({
    queryKey: ['assigned-trainer', profile?.trainerId],
    queryFn: async () => {
      if (!profile?.trainerId) return null
      const trainer = trainers.find(t => t.uid === profile.trainerId)
      return trainer || null
    },
    enabled: !!profile?.trainerId && trainers.length > 0,
  })

  // Fetch info for pending trainer if exists
  const { data: pendingTrainer, isLoading: isLoadingPendingTrainer } = useQuery({
    queryKey: ['pending-trainer', profile?.pendingTrainerId],
    queryFn: async () => {
      if (!profile?.pendingTrainerId) return null
      const trainer = trainers.find(t => t.uid === profile.pendingTrainerId)
      return trainer || null
    },
    enabled: !!profile?.pendingTrainerId && trainers.length > 0,
  })

  // Fetch trainees if user is a trainer
  const { data: myTrainees = [], isLoading: isLoadingTrainees } = useQuery({
    queryKey: ['my-trainees', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getTrainerClients(user.uid)
    },
    enabled: profile?.role === 'trainer' && !!user?.uid,
  })

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

    const toastId = toast.loading('Updating profile...')

    try {
      // Update Firestore Profile
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: data.displayName,
        role: data.role,
        age: data.age,
        weight: data.weight,
        height: data.height,
      })

      // Update Auth Profile Display Name if changed
      if (data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName })
      }

      await refreshProfile()
      toast.success('Profile updated successfully!', { id: toastId })
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update profile. Please try again.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const onRequestAccess = async () => {
    if (!user || !selectedTrainerId) {
      toast.error('Please select a trainer')
      return
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pendingTrainerId: selectedTrainerId,
      })

      const trainer = trainers.find(t => t.uid === selectedTrainerId)
      const trainerName = trainer?.displayName || trainer?.email || 'Trainer'

      toast.success(`Request sent to ${trainerName}`)
      setSelectedTrainerId('')
      await refreshProfile()
    } catch (error) {
      console.error('Failed to send request', error)
      toast.error('Failed to send request. Please try again.')
    }
  }

  const onCancelRequest = async () => {
    if (!user) return

    const confirmed = window.confirm('Are you sure you want to cancel your request?')
    if (!confirmed) return

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pendingTrainerId: deleteField(),
      })
      toast.success('Request cancelled')
      await refreshProfile()
    } catch (error) {
      console.error('Failed to cancel request', error)
      toast.error('Failed to cancel request')
    }
  }

  const onRemoveTrainer = async () => {
    if (!user || !profile?.trainerId) {
      toast.error('No trainer assigned')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove your trainer? They will no longer have access to your activity logs.'
    )

    if (!confirmed) return

    const toastId = toast.loading('Removing trainer...')

    try {
      const trainer = trainers.find(t => t.uid === profile.trainerId)

      await updateDoc(doc(db, 'users', user.uid), {
        trainerId: deleteField(),
        allowedTrainers: trainer?.email ? arrayRemove(trainer.email) : [],
      })

      toast.success('Trainer removed successfully', { id: toastId })
      await refreshProfile()
    } catch (error) {
      console.error('Failed to remove trainer', error)
      toast.error('Failed to remove trainer. Please try again.', { id: toastId })
    }
  }

  const onRemoveTrainee = async (traineeId: string, traineeName: string) => {
    if (!user) return

    const confirmed = window.confirm(
      `Are you sure you want to remove ${traineeName} as your trainee? You will no longer have access to their activity logs.`
    )

    if (!confirmed) return

    const toastId = toast.loading('Removing trainee...')

    try {
      // Create a reference to the operation for logging if needed
      // const trainee = myTrainees.find(t => t.uid === traineeId)

      await updateDoc(doc(db, 'users', traineeId), {
        trainerId: deleteField(),
        allowedTrainers: user.email ? arrayRemove(user.email) : [],
      })

      toast.success(`${traineeName} removed successfully`, { id: toastId })
      // Refetch trainees list
      await refreshProfile()
    } catch (error) {
      console.error('Failed to remove trainee', error)
      toast.error('Failed to remove trainee. Please try again.', { id: toastId })
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

          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-8">
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
              className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-background-dark font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Trainer/Trainee Section - Conditional Rendering */}
        {profile?.role === 'trainer' ? (
          // TRAINER VIEW: Show list of trainees
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="material-icons text-purple-400">group</span>
              </div>
              My Trainees
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Trainees who have granted you access to their activity logs and progress.
            </p>

            {isLoadingTrainees ? (
              <div className="text-sm text-slate-400">Loading trainees...</div>
            ) : myTrainees.length === 0 ? (
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 text-center">
                <span className="material-icons text-slate-600 text-5xl mb-3">person_off</span>
                <p className="text-slate-400 text-sm">No trainees yet</p>
                <p className="text-slate-500 text-xs mt-1">
                  Requests will appear on your Dashboard
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTrainees.map(trainee => (
                  <div
                    key={trainee.uid}
                    className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="material-icons text-purple-400 text-xl">person</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {trainee.displayName || 'Unnamed User'}
                        </p>
                        <p className="text-slate-400 text-xs">{trainee.email}</p>
                      </div>
                      <button
                        onClick={() =>
                          onRemoveTrainee(
                            trainee.uid,
                            trainee.displayName || trainee.email || 'trainee'
                          )
                        }
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                        title="Remove trainee"
                      >
                        <span className="material-icons text-lg">person_remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : profile?.trainerId ? (
          // TRAINEE VIEW: Show assigned trainer
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="material-icons text-purple-400">supervisor_account</span>
              </div>
              Your Trainer
            </h2>
            <p className="text-slate-400 text-sm mb-6">You have already selected a trainer.</p>

            {isLoadingAssignedTrainer ? (
              <div className="text-sm text-slate-400">Loading trainer info...</div>
            ) : assignedTrainer ? (
              <div className="space-y-4">
                <div className="bg-black/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="material-icons text-purple-400 text-3xl">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">
                        {assignedTrainer.displayName || 'Unnamed Trainer'}
                      </p>
                      <p className="text-slate-400 text-sm">{assignedTrainer.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                        <span className="material-icons text-purple-400 text-sm">check_circle</span>
                        <span className="text-purple-300 text-xs font-semibold">
                          Active Trainer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onRemoveTrainer}
                  className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-lg">person_remove</span>
                  Remove Trainer
                </button>
              </div>
            ) : (
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm">Trainer information not available</p>
              </div>
            )}
          </div>
        ) : profile?.pendingTrainerId ? (
          // TRAINEE VIEW: PENDING REQUEST
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-yellow-900/10 border border-yellow-500/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="material-icons text-yellow-400">pending_actions</span>
              </div>
              Request Pending
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              You have sent a request to a trainer. Waiting for approval.
            </p>

            {isLoadingPendingTrainer ? (
              <div className="text-sm text-slate-400">Loading request info...</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/20 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <span className="material-icons text-yellow-400 text-3xl">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">
                        {pendingTrainer?.displayName || pendingTrainer?.email || 'Unknown Trainer'}
                      </p>
                      <p className="text-slate-400 text-sm">{pendingTrainer?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                        <span className="material-icons text-yellow-400 text-sm">
                          hourglass_empty
                        </span>
                        <span className="text-yellow-300 text-xs font-semibold">
                          Awaiting Approval
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onCancelRequest}
                  className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-lg">cancel</span>
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        ) : (
          // TRAINEE VIEW: No trainer assigned - show selection
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="material-icons text-purple-400">supervisor_account</span>
              </div>
              Request Trainer Access
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Select a trainer to request access. They must approve your request before they can see
              your logs.
            </p>

            <div className="space-y-4">
              {isLoadingTrainers ? (
                <div className="text-sm text-slate-400">Loading trainers...</div>
              ) : (
                <div className="flex gap-4">
                  <select
                    value={selectedTrainerId}
                    onChange={e => setSelectedTrainerId(e.target.value)}
                    className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="">Select a trainer...</option>
                    {trainers.map(trainer => (
                      <option key={trainer.uid} value={trainer.uid}>
                        {trainer.displayName || trainer.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={onRequestAccess}
                    disabled={!selectedTrainerId}
                    className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Access
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
