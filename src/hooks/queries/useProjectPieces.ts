import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getProjectPieces } from '@/lib/firestore/pieces'

export function useProjectPieces(userId: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.pieces(userId ?? '', projectId ?? ''),
    queryFn: () => getProjectPieces(userId!, projectId!),
    enabled: !!userId && !!projectId,
    staleTime: 0,
  })
}
