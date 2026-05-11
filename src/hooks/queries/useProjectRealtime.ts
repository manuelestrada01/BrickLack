import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { projectConverter } from '@/lib/firestore/converters'
import type { Project } from '@/types'

export function useProjectRealtime(projectId: string | undefined) {
  const [data, setData] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    const ref = doc(db, 'projects', projectId).withConverter(projectConverter)
    const unsub = onSnapshot(ref, (snap) => {
      setData(snap.exists() ? snap.data() : null)
      setIsLoading(false)
    })
    return unsub
  }, [projectId])

  return { data, isLoading }
}
