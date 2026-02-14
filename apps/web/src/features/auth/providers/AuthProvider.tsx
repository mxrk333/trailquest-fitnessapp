import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  role?: 'trainee' | 'trainer' | 'hiker' | 'admin'
  isApproved?: boolean
  trainerId?: string // ID of assigned trainer
  pendingTrainerId?: string // ID of requested trainer
  age?: number
  weight?: number
  height?: number
  onboardingCompleted?: boolean
  certifications?: string // Trainer credentials
  specialization?: string // Trainer area of expertise
  subscriptionTier?: 'free' | 'pro'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any
  allowedTrainers?: string[]
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  refreshProfile: () => Promise<void>
  updateProfileLocally: (data: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  refreshProfile: async () => {},
  updateProfileLocally: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const updateProfileLocally = (data: Partial<UserProfile>) => {
    setProfile(prev => (prev ? { ...prev, ...data } : null))
  }

  const refreshProfile = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile)
        }
      } catch (error) {
        console.error('Error refreshing user profile:', error)
        throw error
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser)

      if (currentUser) {
        setProfileLoading(true)
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile)
          } else {
            setProfile(null)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        } finally {
          setProfileLoading(false)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, profileLoading, refreshProfile, updateProfileLocally }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
