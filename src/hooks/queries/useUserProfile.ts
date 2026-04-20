import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getUserDoc } from '@/lib/firestore/users'

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.profile(userId ?? ''),
    queryFn: () => getUserDoc(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minuto
  })
}
