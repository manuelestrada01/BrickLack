import type { Timestamp } from 'firebase/firestore'

export type MocStatus = 'active' | 'flagged' | 'removed'

export interface MocPieceDoc {
  partNum: string
  name: string
  color: string
  colorCode: string
  imageUrl: string
  quantityRequired: number
}

export interface MocPiece extends MocPieceDoc {
  id: string
}

export interface MocDoc {
  authorId: string
  authorName: string
  authorPhotoURL: string
  name: string
  description: string
  imageUrl: string
  totalPieces: number
  cloneCount: number
  likeCount: number
  status: MocStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Moc {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL: string
  name: string
  description: string
  imageUrl: string
  totalPieces: number
  cloneCount: number
  likeCount: number
  status: MocStatus
  createdAt: Date
  updatedAt: Date
}

export interface MocReport {
  projectId: string
  reporterId: string
  reason: string
  createdAt: Timestamp
}
