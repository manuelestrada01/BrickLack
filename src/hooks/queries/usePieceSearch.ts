import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { searchParts } from '@/lib/rebrickable'

export function usePieceSearch(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.pieces.search(query),
    queryFn: ({ pageParam = 1 }) => searchParts(query, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}
