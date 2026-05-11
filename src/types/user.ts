import type { Timestamp } from 'firebase/firestore'

export interface UserDoc {
  displayName: string
  email: string
  photoURL: string
  createdAt: Timestamp
  scanCount: number
  scanResetDate: Timestamp
  friendCode: string          // 6-digit unique code, e.g. "143872"
}

export interface User {
  uid: string
  displayName: string
  email: string
  photoURL: string
  createdAt: Date
  scanCount: number
  scanResetDate: Date
  friendCode: string
}
