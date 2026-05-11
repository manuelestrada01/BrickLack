import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { pieceConverter } from '@/lib/firestore/converters'
import type { ProjectPiece } from '@/types'

export function useProjectPiecesRealtime(projectId: string | undefined) {
  const [data, setData] = useState<ProjectPiece[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Track which piece IDs were just updated externally (for flash animation)
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)

    const ref = collection(db, 'projects', projectId, 'pieces').withConverter(pieceConverter)
    const q = query(ref, orderBy('name'))

    let first = true
    const unsub = onSnapshot(q, (snap) => {
      if (first) {
        first = false
        setData(snap.docs.map(d => d.data()))
        setIsLoading(false)
        return
      }

      // Collect IDs of docs that changed (not added/removed) for flash animation
      const changed = new Set<string>()
      snap.docChanges().forEach(change => {
        if (change.type === 'modified') changed.add(change.doc.id)
      })

      setData(snap.docs.map(d => d.data()))
      setIsLoading(false)

      if (changed.size > 0) {
        setUpdatedIds(changed)
        // Clear after animation window
        setTimeout(() => setUpdatedIds(new Set()), 1200)
      }
    })

    return unsub
  }, [projectId])

  return { data, isLoading, updatedIds }
}
