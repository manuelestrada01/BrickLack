import {
  collection,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { pieceConverter } from './converters'
import type { ProjectPiece, PieceDoc } from '@/types'

const BATCH_SIZE = 499

function piecesRef(projectId: string) {
  return collection(db, 'projects', projectId, 'pieces').withConverter(pieceConverter)
}

export async function getProjectPieces(projectId: string): Promise<ProjectPiece[]> {
  const q = query(piecesRef(projectId), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data())
}

export async function batchAddPieces(
  projectId: string,
  pieces: PieceDoc[],
): Promise<void> {
  for (let i = 0; i < pieces.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = pieces.slice(i, i + BATCH_SIZE)
    for (const piece of chunk) {
      const ref = doc(collection(db, 'projects', projectId, 'pieces'))
      batch.set(ref, piece)
    }
    await batch.commit()
  }
}

export async function updatePieceQuantity(
  projectId: string,
  pieceId: string,
  quantityFound: number,
  isComplete: boolean,
): Promise<void> {
  await updateDoc(
    doc(db, 'projects', projectId, 'pieces', pieceId),
    { quantityFound, isComplete },
  )
}

export async function assignPieces(
  projectId: string,
  assignments: { pieceId: string; assignedTo: string | null }[],
): Promise<void> {
  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = assignments.slice(i, i + BATCH_SIZE)
    for (const { pieceId, assignedTo } of chunk) {
      batch.update(doc(db, 'projects', projectId, 'pieces', pieceId), { assignedTo })
    }
    await batch.commit()
  }
}
