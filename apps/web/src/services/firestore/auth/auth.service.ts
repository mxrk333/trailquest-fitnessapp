import { auth, googleProvider } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth'

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log('✅ User signed up:', userCredential.user)
    return userCredential.user
  } catch (error: any) {
    console.error('❌ Sign-up error:', error.message)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log('✅ User signed in:', userCredential.user)
    return userCredential.user
  } catch (error: any) {
    console.error('❌ Sign-in error:', error.message)
    throw error
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    console.log('✅ Google sign-in successful:', result.user)
    return result.user
  } catch (error: any) {
    console.error('❌ Google sign-in error:', error.message)
    throw error
  }
}

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth)
    console.log('✅ User signed out')
  } catch (error: any) {
    console.error('❌ Sign-out error:', error.message)
    throw error
  }
}
