import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  limit,
} from 'firebase/firestore'
import type { User as FirebaseUser } from 'firebase/auth'
import { db } from '@/config/firebase'
import { userConverter } from './converters'
import type { User, UserSearchResult } from '@/types'

function userRef(userId: string) {
  return doc(db, 'users', userId).withConverter(userConverter)
}

// ─── Friend code generation ────────────────────────────────────────────────

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function generateUniqueFriendCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode()
    const q = query(collection(db, 'users'), where('friendCode', '==', code), limit(1))
    const snap = await getDocs(q)
    if (snap.empty) return code
  }
  // Fallback: collision extremely unlikely but handled
  return randomCode()
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export async function getUserDoc(userId: string): Promise<User | null> {
  const snapshot = await getDoc(userRef(userId))
  return snapshot.exists() ? snapshot.data() : null
}

export async function createUserDoc(firebaseUser: FirebaseUser): Promise<User> {
  const now = new Date()
  const friendCode = await generateUniqueFriendCode()

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    displayName: firebaseUser.displayName ?? 'Usuario',
    email: firebaseUser.email ?? '',
    photoURL: firebaseUser.photoURL ?? '',
    createdAt: Timestamp.fromDate(now),
    scanCount: 0,
    scanResetDate: Timestamp.fromDate(now),
    friendCode,
  })

  const snapshot = await getDoc(userRef(firebaseUser.uid))
  return snapshot.data()!
}

/** Lazy migration: assign friendCode to existing users who don't have one yet. */
export async function ensureFriendCode(userId: string): Promise<string> {
  const snap = await getDoc(doc(db, 'users', userId))
  if (!snap.exists()) return ''
  const existing = snap.data().friendCode as string | undefined
  if (existing) return existing

  const code = await generateUniqueFriendCode()
  await updateDoc(doc(db, 'users', userId), { friendCode: code })
  return code
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

// ─── Search by friend code ────────────────────────────────────────────────

export async function searchUserByFriendCode(
  code: string,
  currentUserId: string,
): Promise<UserSearchResult | null> {
  const normalized = code.replace(/^#/, '').trim()
  const q = query(
    collection(db, 'users'),
    where('friendCode', '==', normalized),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  if (d.id === currentUserId) return null  // can't add yourself
  const data = d.data()
  return {
    uid: d.id,
    displayName: data.displayName as string,
    photoURL: data.photoURL as string,
    email: data.email as string,
  }
}
