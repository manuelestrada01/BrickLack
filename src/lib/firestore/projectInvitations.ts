import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { ProjectInvitation, ProjectInvitationDoc, ProjectMemberDoc } from '@/types'

// Deterministic ID: "{projectId}_{toUserId}" — one invite per project per invitee
function invitationId(projectId: string, toUserId: string) {
  return `${projectId}_${toUserId}`
}

function fromDoc(id: string, data: ProjectInvitationDoc): ProjectInvitation {
  return {
    id,
    projectId: data.projectId,
    projectName: data.projectName,
    projectImageUrl: data.projectImageUrl,
    fromUserId: data.fromUserId,
    fromDisplayName: data.fromDisplayName,
    toUserId: data.toUserId,
    status: data.status,
    createdAt: data.createdAt.toDate(),
  }
}

export async function sendProjectInvitation(
  from: { userId: string; displayName: string },
  to: { userId: string },
  project: { id: string; name: string; imageUrl: string | null },
): Promise<string> {
  const id = invitationId(project.id, to.userId)
  await setDoc(doc(db, 'projectInvitations', id), {
    projectId: project.id,
    projectName: project.name,
    projectImageUrl: project.imageUrl,
    fromUserId: from.userId,
    fromDisplayName: from.displayName,
    toUserId: to.userId,
    status: 'pending',
    createdAt: Timestamp.now(),
  } satisfies ProjectInvitationDoc)
  return id
}

export async function getReceivedProjectInvitations(userId: string): Promise<ProjectInvitation[]> {
  const q = query(
    collection(db, 'projectInvitations'),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => fromDoc(d.id, d.data() as ProjectInvitationDoc))
}

export async function getSentProjectInvitations(projectId: string): Promise<ProjectInvitation[]> {
  const q = query(
    collection(db, 'projectInvitations'),
    where('projectId', '==', projectId),
    where('status', '==', 'pending'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => fromDoc(d.id, d.data() as ProjectInvitationDoc))
}

export async function hasPendingProjectInvitation(
  projectId: string,
  toUserId: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, 'projectInvitations', invitationId(projectId, toUserId)))
  return snap.exists() && snap.data()?.status === 'pending'
}

export async function acceptProjectInvitation(
  invitationId: string,
  user: { userId: string; displayName: string; photoURL: string },
): Promise<void> {
  const invRef = doc(db, 'projectInvitations', invitationId)
  const invSnap = await getDoc(invRef)
  if (!invSnap.exists()) throw new Error('Invitation not found')
  const data = invSnap.data() as ProjectInvitationDoc

  const newMember: ProjectMemberDoc = {
    userId: user.userId,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'editor',
    joinedAt: Timestamp.now(),
    assignedPieces: 0,
    foundPieces: 0,
  }

  // Update project: add member (rules allow this because invitation exists)
  await updateDoc(doc(db, 'projects', data.projectId), {
    memberIds: arrayUnion(user.userId),
    members: arrayUnion(newMember),
  })

  // Mark invitation accepted
  await updateDoc(invRef, { status: 'accepted' })
}

export async function rejectProjectInvitation(invitationId: string): Promise<void> {
  await updateDoc(doc(db, 'projectInvitations', invitationId), { status: 'rejected' })
}

export async function cancelProjectInvitation(
  projectId: string,
  toUserId: string,
): Promise<void> {
  await updateDoc(
    doc(db, 'projectInvitations', invitationId(projectId, toUserId)),
    { status: 'rejected' },
  )
}
