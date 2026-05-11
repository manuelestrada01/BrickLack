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
  const raw = snapshot.docs.map((d) => d.data() as SetCachePiece)

  // Safety net: deduplicate stale cache that may have been written with dupes
  const map = new Map<string, SetCachePiece>()
  for (const piece of raw) {
    const key = `${piece.partNum}-${piece.colorCode}`
    const existing = map.get(key)
    if (existing) {
      existing.quantity += piece.quantity
    } else {
      map.set(key, { ...piece })
    }
  }

  return Array.from(map.values())
}

export async function cacheSetPieces(setId: string, pieces: SetCachePiece[]): Promise<void> {
  for (let i = 0; i < pieces.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = pieces.slice(i, i + BATCH_SIZE)
    for (const piece of chunk) {
      // Use deterministic doc ID to prevent duplicates on re-cache
      const docId = `${piece.partNum}-${piece.colorCode}`
      const ref = doc(collection(db, 'sets', setId, 'pieces'), docId)
      batch.set(ref, piece)
    }
    await batch.commit()
  }
}
