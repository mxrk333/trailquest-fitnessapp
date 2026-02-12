import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
// DISABLED: Photo upload imports (Firebase Storage not enabled)
// Uncomment when Storage is enabled:
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
// import { db, storage } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { getAllTrainers } from '@/services/firestore/trainers'
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
    } catch (error) {
      console.error('Failed to grant access', error)
      toast.error('Failed to grant access. Please try again.')
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

        {/* Trainer Access Section */}
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
      </div>
    </DashboardLayout>
  )
}
