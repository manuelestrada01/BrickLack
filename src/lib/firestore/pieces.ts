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

function piecesRef(userId: string, projectId: string) {
  return collection(db, 'users', userId, 'projects', projectId, 'pieces').withConverter(
    pieceConverter,
  )
}

export async function getProjectPieces(userId: string, projectId: string): Promise<ProjectPiece[]> {
  const q = query(piecesRef(userId, projectId), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data())
}

export async function batchAddPieces(
  userId: string,
  projectId: string,
  pieces: PieceDoc[],
): Promise<void> {
  for (let i = 0; i < pieces.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = pieces.slice(i, i + BATCH_SIZE)
    for (const piece of chunk) {
      const ref = doc(collection(db, 'users', userId, 'projects', projectId, 'pieces'))
      batch.set(ref, piece)
    }
    await batch.commit()
  }
}

export async function updatePieceQuantity(
  userId: string,
  projectId: string,
  pieceId: string,
  quantityFound: number,
  isComplete: boolean,
): Promise<void> {
  await updateDoc(
    doc(db, 'users', userId, 'projects', projectId, 'pieces', pieceId),
    { quantityFound, isComplete },
  )
}
