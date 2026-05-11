import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { projectConverter } from './converters'
import type { Project, ProjectDoc, ProjectMember } from '@/types'

function projectsRef() {
  return collection(db, 'projects').withConverter(projectConverter)
}

function projectRef(projectId: string) {
  return doc(db, 'projects', projectId).withConverter(projectConverter)
}

export async function getProjects(userId: string): Promise<Project[]> {
  const q = query(
    projectsRef(),
    where('memberIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data())
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snapshot = await getDoc(projectRef(projectId))
  return snapshot.exists() ? snapshot.data() : null
}

export async function createProject(
  userId: string,
  displayName: string,
  photoURL: string,
  data: Omit<ProjectDoc, 'createdAt' | 'updatedAt' | 'ownerId' | 'members' | 'memberIds'>,
): Promise<string> {
  const now = Timestamp.now()
  const ownerMember = {
    userId,
    displayName,
    photoURL,
    role: 'owner',
    joinedAt: now,
    assignedPieces: 0,
    foundPieces: 0,
  }
  const ref = await addDoc(collection(db, 'projects'), {
    ...data,
    ownerId: userId,
    members: [ownerMember],
    memberIds: [userId],
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateProject(
  projectId: string,
  data: Partial<Pick<Project, 'name' | 'status' | 'foundPieces' | 'totalPieces' | 'members' | 'memberIds'>>,
): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function updateProjectMember(
  projectId: string,
  member: ProjectMember,
): Promise<void> {
  const project = await getProject(projectId)
  if (!project) throw new Error('Project not found')
  const members = project.members.map((m) =>
    m.userId === member.userId ? member : m,
  )
  await updateProject(projectId, { members })
}

export async function removeProjectMember(
  projectId: string,
  memberIdToRemove: string,
): Promise<void> {
  const project = await getProject(projectId)
  if (!project) throw new Error('Project not found')
  const members = project.members.filter(m => m.userId !== memberIdToRemove)
  const memberIds = project.memberIds.filter(id => id !== memberIdToRemove)
  await updateDoc(doc(db, 'projects', projectId), {
    members,
    memberIds,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId))
}
