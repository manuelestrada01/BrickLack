import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'in_progress' | 'completed' | 'paused'

export interface ProjectDoc {
  name: string
  setId: string | null
  setName: string | null
  setImageUrl: string | null
  status: ProjectStatus
  createdAt: Timestamp
  updatedAt: Timestamp
  totalPieces: number
  foundPieces: number
}

export interface Project {
  id: string
  name: string
  setId: string | null
  setName: string | null
  setImageUrl: string | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  totalPieces: number
  foundPieces: number
}
