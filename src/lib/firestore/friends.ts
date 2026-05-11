import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type {
  FriendRequest,
  FriendRequestDoc,
  Friend,
  FriendDoc,
  UserSearchResult,
} from '@/types'

// ─── Converters ───────────────────────────────────────────────────────────────

function friendRequestFromDoc(id: string, data: FriendRequestDoc): FriendRequest {
  return {
    id,
    fromUserId: data.fromUserId,
    fromDisplayName: data.fromDisplayName,
    fromPhotoURL: data.fromPhotoURL,
    toUserId: data.toUserId,
    toDisplayName: data.toDisplayName,
    toPhotoURL: data.toPhotoURL,
    status: data.status,
    createdAt: data.createdAt.toDate(),
  }
}

function friendFromDoc(data: FriendDoc): Friend {
  return {
    userId: data.userId,
    displayName: data.displayName,
    photoURL: data.photoURL,
    addedAt: data.addedAt.toDate(),
  }
}

// ─── User search (re-export from users.ts for convenience) ───────────────────
export { searchUserByFriendCode } from './users'

// ─── Friend requests ──────────────────────────────────────────────────────────

export async function getReceivedFriendRequests(userId: string): Promise<FriendRequest[]> {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => friendRequestFromDoc(d.id, d.data() as FriendRequestDoc))
}

export async function getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
  const q = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => friendRequestFromDoc(d.id, d.data() as FriendRequestDoc))
}

export async function hasPendingRequest(
  fromUserId: string,
  toUserId: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, 'friendRequests', `${fromUserId}_${toUserId}`))
  return snap.exists() && snap.data()?.status === 'pending'
}

export async function sendFriendRequest(
  from: { userId: string; displayName: string; photoURL: string },
  to: UserSearchResult,
): Promise<string> {
  // Deterministic ID: "{fromUserId}_{toUserId}" — enables rule-based verification on accept
  const requestId = `${from.userId}_${to.uid}`
  const ref = doc(db, 'friendRequests', requestId)
  await setDoc(ref, {
    fromUserId: from.userId,
    fromDisplayName: from.displayName,
    fromPhotoURL: from.photoURL,
    toUserId: to.uid,
    toDisplayName: to.displayName,
    toPhotoURL: to.photoURL,
    status: 'pending',
    createdAt: Timestamp.now(),
  } satisfies FriendRequestDoc)
  return requestId
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  const reqRef = doc(db, 'friendRequests', requestId)
  const reqSnap = await getDoc(reqRef)
  if (!reqSnap.exists()) throw new Error('Request not found')

  const data = reqSnap.data() as FriendRequestDoc
  const now = Timestamp.now()

  const batch = writeBatch(db)

  // Mark request as accepted
  batch.update(reqRef, { status: 'accepted' })

  // Add bilateral friend docs
  const fromFriendRef = doc(db, 'users', data.fromUserId, 'friends', data.toUserId)
  const toFriendRef = doc(db, 'users', data.toUserId, 'friends', data.fromUserId)

  batch.set(fromFriendRef, {
    userId: data.toUserId,
    displayName: data.toDisplayName,
    photoURL: data.toPhotoURL,
    addedAt: now,
  } satisfies FriendDoc)

  batch.set(toFriendRef, {
    userId: data.fromUserId,
    displayName: data.fromDisplayName,
    photoURL: data.fromPhotoURL,
    addedAt: now,
  } satisfies FriendDoc)

  await batch.commit()
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' })
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, 'friendRequests', requestId))
}

// ─── Friends list ─────────────────────────────────────────────────────────────

export async function getFriends(userId: string): Promise<Friend[]> {
  const q = query(
    collection(db, 'users', userId, 'friends'),
    orderBy('addedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => friendFromDoc(d.data() as FriendDoc))
}

export async function isFriend(userId: string, friendId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', userId, 'friends', friendId))
  return snap.exists()
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const batch = writeBatch(db)
  // userId's own entry: allowed by "auth.uid == userId" rule
  batch.delete(doc(db, 'users', userId, 'friends', friendId))
  // friendId's entry (cross-delete): allowed by "auth.uid == friendId" rule
  batch.delete(doc(db, 'users', friendId, 'friends', userId))
  await batch.commit()
}
