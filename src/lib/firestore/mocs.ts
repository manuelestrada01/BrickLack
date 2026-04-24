import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  where,
  runTransaction,
  limit,
  increment,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { mocConverter, mocPieceConverter } from './converters'
import type { Moc, MocDoc, MocPiece, MocPieceDoc, MocReport } from '@/types'

function mocsRef() {
  return collection(db, 'community_projects').withConverter(mocConverter)
}

function mocRef(mocId: string) {
  return doc(db, 'community_projects', mocId).withConverter(mocConverter)
}

function mocPiecesRef(mocId: string) {
  return collection(db, 'community_projects', mocId, 'pieces').withConverter(mocPieceConverter)
}

export async function getCommunityMocs(limitCount = 24): Promise<Moc[]> {
  // Ordenamos solo por createdAt (índice simple, no requiere índice compuesto)
  // El filtro de status 'active' lo hacemos client-side
  const q = query(mocsRef(), orderBy('createdAt', 'desc'), limit(limitCount * 2))
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d) => d.data())
    .filter((m) => m.status === 'active' && m.imageUrl !== '')
    .slice(0, limitCount)
}

export async function getMoc(mocId: string): Promise<Moc | null> {
  const snapshot = await getDoc(mocRef(mocId))
  return snapshot.exists() ? snapshot.data() : null
}

export async function getMocPieces(mocId: string): Promise<MocPiece[]> {
  const snapshot = await getDocs(mocPiecesRef(mocId))
  return snapshot.docs.map((d) => d.data())
}

export async function createMoc(
  data: Omit<MocDoc, 'createdAt' | 'updatedAt' | 'cloneCount' | 'likeCount' | 'status'>,
  pieces: Omit<MocPieceDoc, 'id'>[],
): Promise<string> {
  const now = Timestamp.now()
  const mocRef = await addDoc(collection(db, 'community_projects'), {
    ...data,
    cloneCount: 0,
    likeCount: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })

  // Add pieces in parallel
  await Promise.all(
    pieces.map((piece) => addDoc(collection(db, 'community_projects', mocRef.id, 'pieces'), piece)),
  )

  return mocRef.id
}

export async function cloneMocToProject(
  mocId: string,
  userId: string,
  _userName: string,
): Promise<string> {
  const [moc, pieces] = await Promise.all([getMoc(mocId), getMocPieces(mocId)])

  if (!moc) throw new Error('MOC not found')

  let projectId: string

  await runTransaction(db, async (transaction) => {
    const mocDocRef = doc(db, 'community_projects', mocId)
    const mocSnap = await transaction.get(mocDocRef)
    if (!mocSnap.exists()) throw new Error('MOC not found')

    const now = Timestamp.now()
    const projectRef = doc(collection(db, 'users', userId, 'projects'))
    projectId = projectRef.id

    transaction.set(projectRef, {
      name: moc.name,
      setId: null,
      setName: null,
      setImageUrl: moc.imageUrl,
      status: 'in_progress',
      totalPieces: moc.totalPieces,
      foundPieces: 0,
      clonedFrom: mocId,
      createdAt: now,
      updatedAt: now,
    })

    transaction.update(mocDocRef, {
      cloneCount: (mocSnap.data().cloneCount ?? 0) + 1,
    })
  })

  // Add pieces to the new project
  await Promise.all(
    pieces.map((piece) =>
      addDoc(collection(db, 'users', userId, 'projects', projectId!, 'pieces'), {
        partNum: piece.partNum,
        name: piece.name,
        color: piece.color,
        colorCode: piece.colorCode,
        imageUrl: piece.imageUrl,
        quantityRequired: piece.quantityRequired,
        quantityFound: 0,
        isComplete: false,
      }),
    ),
  )

  return projectId!
}

export async function reportMoc(report: Omit<MocReport, 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'reports'), {
    ...report,
    createdAt: serverTimestamp(),
  })

  // Soft delete — flag the MOC
  await updateDoc(doc(db, 'community_projects', report.projectId), {
    status: 'flagged',
  })
}

export async function getUserMocCount(userId: string): Promise<number> {
  const q = query(
    collection(db, 'community_projects'),
    where('authorId', '==', userId),
    where('status', 'in', ['active', 'flagged']),
  )
  const snapshot = await getDocs(q)
  return snapshot.size
}

export async function deleteMoc(mocId: string): Promise<void> {
  await deleteDoc(doc(db, 'community_projects', mocId))
}

function mocLikeRef(mocId: string, userId: string) {
  return doc(db, 'community_projects', mocId, 'likes', userId)
}

export async function getUserLiked(mocId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(mocLikeRef(mocId, userId))
  return snap.exists()
}

export async function toggleLikeMoc(
  mocId: string,
  userId: string,
  currentlyLiked: boolean,
): Promise<void> {
  const likeRef = mocLikeRef(mocId, userId)
  const mocDocRef = doc(db, 'community_projects', mocId)

  if (currentlyLiked) {
    await deleteDoc(likeRef)
    await updateDoc(mocDocRef, { likeCount: increment(-1) })
  } else {
    await setDoc(likeRef, { createdAt: serverTimestamp() })
    await updateDoc(mocDocRef, { likeCount: increment(1) })
  }
}
