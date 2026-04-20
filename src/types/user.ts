import type { Timestamp } from 'firebase/firestore'

export interface UserDoc {
  displayName: string
  email: string
  photoURL: string
  createdAt: Timestamp
  scanCount: number
  scanResetDate: Timestamp
}

export interface User {
  uid: string
  displayName: string
  email: string
  photoURL: string
  createdAt: Date
  scanCount: number
  scanResetDate: Date
}
