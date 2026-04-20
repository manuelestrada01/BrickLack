import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getSet } from '@/lib/rebrickable'

export function useSetDetail(setId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sets.detail(setId ?? ''),
    queryFn: () => getSet(setId!),
    enabled: !!setId,
    staleTime: 30 * 60 * 1000, // 30 minutos — los sets casi no cambian
  })
}
