import { auth, googleProvider, db } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth'
import { doc, setDoc, updateDoc } from 'firebase/firestore'

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: string,
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, {
      displayName: name,
    })

    // Save user role to Firestore — physical stats collected during onboarding
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      role: role,
      isApproved: role === 'trainer' ? false : true,
      onboardingCompleted: false,
      createdAt: new Date(),
    })

    console.log('✅ User signed up and profile created:', userCredential.user)
    return userCredential.user
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Sign-up error:', error.message)
    }
    throw error
  }
}

export const createGoogleUserProfile = async (
  user: User,
  role: string,
): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      role: role,
      isApproved: role === 'trainer' ? false : true,
      onboardingCompleted: false,
      createdAt: new Date(),
    })
    console.log('✅ Google user profile created')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Google profile creation error:', error.message)
    }
    throw error
  }
}

export const completeOnboarding = async (
  uid: string,
  data: Record<string, unknown>,
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    console.log('✅ Onboarding completed')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Onboarding error:', error.message)
    }
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log('✅ User signed in:', userCredential.user)
    return userCredential.user
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Sign-in error:', error.message)
    }
    throw error
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    console.log('✅ Google sign-in successful:', result.user)
    return result.user
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Google sign-in error:', error.message)
    }
    throw error
  }
}

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth)
    console.log('✅ User signed out')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Sign-out error:', error.message)
    }
    throw error
  }
}
