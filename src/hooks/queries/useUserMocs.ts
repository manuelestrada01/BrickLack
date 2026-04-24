import { useQuery } from '@tanstack/react-query'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { mocConverter } from '@/lib/firestore/converters'
import { queryKeys } from './queryKeys'

async function getUserMocs(userId: string) {
  const q = query(
    collection(db, 'community_projects').withConverter(mocConverter),
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

export function useUserMocs(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.community.all(), 'user', userId ?? ''],
    queryFn: () => getUserMocs(userId!),
    enabled: !!userId,
    staleTime: 0,
  })
}
