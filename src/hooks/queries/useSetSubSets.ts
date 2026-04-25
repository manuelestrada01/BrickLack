import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getSetSubSets } from '@/lib/rebrickable'

export function useSetSubSets(setId: string | undefined, enabled = false) {
  return useQuery({
    queryKey: queryKeys.sets.subsets(setId ?? ''),
    queryFn: () => getSetSubSets(setId!),
    enabled: !!setId && enabled,
    staleTime: 30 * 60 * 1000,
  })
}
