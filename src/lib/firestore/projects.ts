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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { projectConverter } from './converters'
import type { Project, ProjectDoc } from '@/types'

function projectsRef(userId: string) {
  return collection(db, 'users', userId, 'projects').withConverter(projectConverter)
}

function projectRef(userId: string, projectId: string) {
  return doc(db, 'users', userId, 'projects', projectId).withConverter(projectConverter)
}

export async function getProjects(userId: string): Promise<Project[]> {
  const q = query(projectsRef(userId), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data())
}

export async function getProject(userId: string, projectId: string): Promise<Project | null> {
  const snapshot = await getDoc(projectRef(userId, projectId))
  return snapshot.exists() ? snapshot.data() : null
}

export async function createProject(
  userId: string,
  data: Omit<ProjectDoc, 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(collection(db, 'users', userId, 'projects'), {
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateProject(
  userId: string,
  projectId: string,
  data: Partial<Pick<Project, 'name' | 'status' | 'foundPieces' | 'totalPieces'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'projects', projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'projects', projectId))
}
