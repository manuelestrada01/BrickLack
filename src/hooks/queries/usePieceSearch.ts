import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { searchParts } from '@/lib/rebrickable'

export function usePieceSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.pieces.search(query),
    queryFn: () => searchParts(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}
