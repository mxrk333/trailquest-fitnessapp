// src/services/firestore/test.service.ts
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    await addDoc(collection(db, 'connection_test'), {
      status: 'connected',
      timestamp: new Date(),
    })
    console.log('✅ Firestore connection test successful')
    return true
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error)
    return false
  }
}
