import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getPart } from '@/lib/rebrickable'

export function usePieceDetail(partNum: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pieces.detail(partNum ?? ''),
    queryFn: () => getPart(partNum!),
    enabled: !!partNum,
    staleTime: 30 * 60 * 1000,
  })
}
