import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'in_progress' | 'completed' | 'paused'
export type ProjectMemberRole = 'owner' | 'editor'
export type ProjectInvitationStatus = 'pending' | 'accepted' | 'rejected'

export interface ProjectInvitationDoc {
  projectId: string
  projectName: string
  projectImageUrl: string | null
  fromUserId: string
  fromDisplayName: string
  toUserId: string
  status: ProjectInvitationStatus
  createdAt: Timestamp
}

export interface ProjectInvitation {
  id: string
  projectId: string
  projectName: string
  projectImageUrl: string | null
  fromUserId: string
  fromDisplayName: string
  toUserId: string
  status: ProjectInvitationStatus
  createdAt: Date
}

export interface ProjectMember {
  userId: string
  displayName: string
  photoURL: string
  role: ProjectMemberRole
  joinedAt: Date
  assignedPieces: number
  foundPieces: number
}

export interface ProjectMemberDoc {
  userId: string
  displayName: string
  photoURL: string
  role: ProjectMemberRole
  joinedAt: Timestamp
  assignedPieces: number
  foundPieces: number
}

export interface ProjectDoc {
  ownerId: string
  members: ProjectMemberDoc[]
  memberIds: string[]          // flat array for array-contains queries
  name: string
  setId: string | null
  setName: string | null
  setImageUrl: string | null
  status: ProjectStatus
  createdAt: Timestamp
  updatedAt: Timestamp
  totalPieces: number
  foundPieces: number
  clonedFrom?: string          // mocId if created from a MOC clone
}

export interface Project {
  id: string
  ownerId: string
  members: ProjectMember[]
  memberIds: string[]
  name: string
  setId: string | null
  setName: string | null
  setImageUrl: string | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  totalPieces: number
  foundPieces: number
  clonedFrom?: string
}
