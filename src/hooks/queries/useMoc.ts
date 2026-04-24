import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getMoc, getMocPieces } from '@/lib/firestore/mocs'

export function useMoc(mocId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.detail(mocId ?? ''),
    queryFn: () => getMoc(mocId!),
    enabled: !!mocId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMocPieces(mocId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.pieces(mocId ?? ''),
    queryFn: () => getMocPieces(mocId!),
    enabled: !!mocId,
    staleTime: 1000 * 60 * 10,
  })
}
