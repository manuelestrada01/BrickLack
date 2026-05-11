import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getProjectPieces } from '@/lib/firestore/pieces'

export function useProjectPieces(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.pieces(projectId ?? ''),
    queryFn: () => getProjectPieces(projectId!),
    enabled: !!projectId,
    staleTime: 0,
  })
}
