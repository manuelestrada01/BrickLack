import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getProjects } from '@/lib/firestore/projects'

export function useProjects(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.all(userId ?? ''),
    queryFn: () => getProjects(userId!),
    enabled: !!userId,
    staleTime: 0, // siempre re-fetch — el usuario muta proyectos activamente
  })
}
