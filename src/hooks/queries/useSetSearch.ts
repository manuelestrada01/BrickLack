import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { searchSets } from '@/lib/rebrickable'

export function useSetSearch(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.sets.search(query),
    queryFn: ({ pageParam = 1 }) => searchSets(query, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}
