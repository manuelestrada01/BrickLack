import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getAllSetParts } from '@/lib/rebrickable'

export function useSetParts(setId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sets.parts(setId ?? ''),
    queryFn: () => getAllSetParts(setId!),
    enabled: !!setId,
    staleTime: 30 * 60 * 1000,
  })
}
