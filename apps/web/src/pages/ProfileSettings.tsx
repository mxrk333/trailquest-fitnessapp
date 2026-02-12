import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { doc, updateDoc, arrayUnion, deleteField, arrayRemove } from 'firebase/firestore'
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

  // Fetch trainees if user is a trainer
  const { data: myTrainees = [], isLoading: isLoadingTrainees } = useQuery({
    queryKey: ['my-trainees', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getTrainerClients(user.uid)
    },
    enabled: profile?.role === 'trainer' && !!user?.uid,
  })

  // DISABLED: Photo upload state (Firebase Storage not enabled)
  // Uncomment when Storage is enabled:
  // const [photoFile, setPhotoFile] = useState<File | null>(null)
  // const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null)
  // const [uploadingPhoto, setUploadingPhoto] = useState(false)
  // const [fileError, setFileError] = useState<string | null>(null)
  // const fileInputRef = useRef<HTMLInputElement>(null)

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

  // DISABLED: Photo upload handlers
  // Uncomment when Storage is enabled:
  /*
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError('Please upload a JPEG, PNG, or WebP image')
        toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError('File size must be less than 2MB')
        toast.error('File size must be less than 2MB')
        return
      }

      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      toast.success('Photo selected! Click "Save Changes" to upload.')
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  */

  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return
    setLoading(true)

    const toastId = toast.loading('Updating profile...')

    try {
      // DISABLED: Profile picture upload (Firebase Storage not enabled)
      // Uncomment when Firebase Storage is enabled:
      /*
      let photoURL = user.photoURL

      // Upload photo if changed
      if (photoFile) {
        setUploadingPhoto(true)
        toast.loading('Uploading photo...', { id: toastId })

        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`)
        await uploadBytes(storageRef, photoFile)
        photoURL = await getDownloadURL(storageRef)

        // Update Auth Profile
        await updateProfile(user, { photoURL })
        setUploadingPhoto(false)
      }
      */

      // Update Firestore Profile
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: data.displayName,
        role: data.role,
        age: data.age,
        weight: data.weight,
        height: data.height,
        // photoURL: photoURL, // Disabled - enable when Storage is ready
      })

      // Update Auth Profile Display Name if changed
      if (data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName })
      }

      // Refresh profile data in AuthContext
      await refreshProfile()

      // Reset photo file state
      // setPhotoFile(null)

      toast.success('Profile updated successfully!', { id: toastId })
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update profile. Please try again.', { id: toastId })
    } finally {
      setLoading(false)
      // setUploadingPhoto(false)
    }
  }

  const onGrantAccess = async () => {
    if (!user || !selectedTrainerId) {
      toast.error('Please select a trainer')
      return
    }

    try {
      // Get trainer email for legacy support or if we want to support both
      const trainer = trainers.find(t => t.uid === selectedTrainerId)

      await updateDoc(doc(db, 'users', user.uid), {
        trainerId: selectedTrainerId, // Primary field for permissions
        allowedTrainers: arrayUnion(trainer?.email || ''), // Backup for email-based rules
      })

      const trainerName = trainer?.displayName || trainer?.email || 'Trainer'
      toast.success(`Access granted to ${trainerName}`)
      setSelectedTrainerId('')
      await refreshProfile()
    } catch (error) {
      console.error('Failed to grant access', error)
      toast.error('Failed to grant access. Please try again.')
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
      const trainee = myTrainees.find(t => t.uid === traineeId)

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
            {/* DISABLED: Profile Photo Upload Section (Firebase Storage not enabled) */}
            {/* Uncomment this section when Firebase Storage is enabled:
            <div className="flex flex-col items-center sm:items-start gap-4 pb-6 border-b border-white/5">
              <label className="block text-sm font-semibold text-slate-300">Profile Photo</label>
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-darker shadow-lg group-hover:border-primary transition-all">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span className="material-icons text-4xl">person</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <span className="material-icons text-white">camera_alt</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors"
                  >
                    Change Photo
                  </button>
                  <p className="text-xs text-slate-500">JPG, PNG, or WebP. Max 2MB.</p>
                  {fileError && <p className="text-red-400 text-xs">{fileError}</p>}
                </div>
              </div>
            </div>
            */}

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
                  Trainees can grant you access from their Profile Settings
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
            <p className="text-slate-400 text-sm mb-6">
              You have already selected a trainer who has access to your activity logs.
            </p>

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
        ) : (
          // TRAINEE VIEW: No trainer assigned - show selection
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-purple-900/10 border border-primary/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="material-icons text-purple-400">supervisor_account</span>
              </div>
              Grant Trainer Access
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Select a trainer to grant them access to your activity logs and progress.
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
                    onClick={onGrantAccess}
                    disabled={!selectedTrainerId}
                    className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Grant Access
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
