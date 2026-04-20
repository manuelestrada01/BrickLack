import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { User } from '@/types'
import { getUserDoc, createUserDoc } from './firestore/users'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export function onAuthChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null)
      return
    }

    try {
      let userDoc = await getUserDoc(firebaseUser.uid)
      if (!userDoc) {
        userDoc = await createUserDoc(firebaseUser)
      }
      callback(userDoc)
    } catch (error) {
      console.error('[Auth] Error loading user doc, using Firebase user as fallback:', error)
      // Fallback: usar los datos de Firebase Auth directamente
      // Ocurre cuando las Firestore rules todavía no fueron desplegadas
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? 'Usuario',
        email: firebaseUser.email ?? '',
        photoURL: firebaseUser.photoURL ?? '',
        createdAt: new Date(),
        scanResetDate: new Date(),
        scanCount: 0,
      })
    }
  })
}
