import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getProject } from '@/lib/firestore/projects'

export function useProject(userId: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(userId ?? '', projectId ?? ''),
    queryFn: () => getProject(userId!, projectId!),
    enabled: !!userId && !!projectId,
    staleTime: 0,
  })
}
