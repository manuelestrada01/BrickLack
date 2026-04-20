import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { User as FirebaseUser } from 'firebase/auth'
import { db } from '@/config/firebase'
import { userConverter } from './converters'
import type { User } from '@/types'

function userRef(userId: string) {
  return doc(db, 'users', userId).withConverter(userConverter)
}

export async function getUserDoc(userId: string): Promise<User | null> {
  const snapshot = await getDoc(userRef(userId))
  return snapshot.exists() ? snapshot.data() : null
}

export async function createUserDoc(firebaseUser: FirebaseUser): Promise<User> {
  const now = new Date()
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    displayName: firebaseUser.displayName ?? 'Usuario',
    email: firebaseUser.email ?? '',
    photoURL: firebaseUser.photoURL ?? '',
    createdAt: Timestamp.fromDate(now),
    scanCount: 0,
    scanResetDate: Timestamp.fromDate(now),
  })

  const snapshot = await getDoc(userRef(firebaseUser.uid))
  return snapshot.data()!
}

export async function updateScanCount(userId: string, newCount: number): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { scanCount: newCount })
}

export async function resetScanCount(userId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    scanCount: 0,
    scanResetDate: serverTimestamp(),
  })
}
