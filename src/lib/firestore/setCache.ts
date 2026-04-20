import {
  collection,
  doc,
  getDocs,
  writeBatch,
  query,
  limit,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { SetCachePiece } from '@/types'

const BATCH_SIZE = 499

function setCacheRef(setId: string) {
  return collection(db, 'sets', setId, 'pieces')
}

export async function isCached(setId: string): Promise<boolean> {
  const q = query(setCacheRef(setId), limit(1))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

export async function getCachedPieces(setId: string): Promise<SetCachePiece[]> {
  const snapshot = await getDocs(setCacheRef(setId))
  return snapshot.docs.map((d) => d.data() as SetCachePiece)
}

export async function cacheSetPieces(setId: string, pieces: SetCachePiece[]): Promise<void> {
  for (let i = 0; i < pieces.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = pieces.slice(i, i + BATCH_SIZE)
    for (const piece of chunk) {
      const ref = doc(collection(db, 'sets', setId, 'pieces'))
      batch.set(ref, piece)
    }
    await batch.commit()
  }
}
