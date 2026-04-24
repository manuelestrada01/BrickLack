import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getUserLiked } from '@/lib/firestore/mocs'

export function useMocLike(mocId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.like(mocId ?? '', userId ?? ''),
    queryFn: () => getUserLiked(mocId!, userId!),
    enabled: !!mocId && !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
