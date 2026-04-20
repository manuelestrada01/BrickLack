import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { searchSets } from '@/lib/rebrickable'

export function useSetSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.sets.search(query),
    queryFn: () => searchSets(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (prev) => prev,
  })
}
