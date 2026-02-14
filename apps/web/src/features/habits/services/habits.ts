import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

const HABITS_COLLECTION = 'dailyHabits'

export interface DailyHabit {
  userId: string
  date: string // YYYY-MM-DD
  water: boolean
  sleep: boolean
  stretching: boolean
  updatedAt: Date
}

/**
 * Build a deterministic doc ID for a user's daily habits entry.
 */
function getDocId(userId: string, date: string): string {
  return `${userId}_${date}`
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Fetch daily habits for a user on a specific date.
 * Returns null if no entry exists yet.
 */
export async function getDailyHabits(userId: string, date: Date): Promise<DailyHabit | null> {
  const dateStr = toDateString(date)
  const docId = getDocId(userId, dateStr)
  const docRef = doc(db, HABITS_COLLECTION, docId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) return null

  const data = snapshot.data()
  return {
    userId: data.userId,
    date: data.date,
    water: data.water ?? false,
    sleep: data.sleep ?? false,
    stretching: data.stretching ?? false,
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  }
}

/**
 * Save (upsert) daily habits for a user on a specific date.
 * Uses a deterministic doc ID so repeated saves overwrite the same document.
 */
export async function saveDailyHabits(
  userId: string,
  date: Date,
  habits: { water: boolean; sleep: boolean; stretching: boolean }
): Promise<void> {
  const dateStr = toDateString(date)
  const docId = getDocId(userId, dateStr)
  const docRef = doc(db, HABITS_COLLECTION, docId)

  await setDoc(docRef, {
    userId,
    date: dateStr,
    ...habits,
    updatedAt: Timestamp.fromDate(new Date()),
  })
}
