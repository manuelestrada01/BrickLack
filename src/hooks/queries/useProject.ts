import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getProject } from '@/lib/firestore/projects'

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
    staleTime: 0,
  })
}
