import type { Timestamp } from 'firebase/firestore'

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface FriendRequestDoc {
  fromUserId: string
  fromDisplayName: string
  fromPhotoURL: string
  toUserId: string
  toDisplayName: string
  toPhotoURL: string
  status: FriendRequestStatus
  createdAt: Timestamp
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromDisplayName: string
  fromPhotoURL: string
  toUserId: string
  toDisplayName: string
  toPhotoURL: string
  status: FriendRequestStatus
  createdAt: Date
}

export interface FriendDoc {
  userId: string
  displayName: string
  photoURL: string
  addedAt: Timestamp
}

export interface Friend {
  userId: string
  displayName: string
  photoURL: string
  addedAt: Date
}

export interface UserSearchResult {
  uid: string
  displayName: string
  photoURL: string
  email: string
}
