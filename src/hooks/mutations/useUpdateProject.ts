import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { updateProject } from '@/lib/firestore/projects'
import type { Project } from '@/types'

interface UpdateProjectInput {
  userId: string
  projectId: string
  data: Partial<Pick<Project, 'name' | 'status'>>
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, data }: UpdateProjectInput) =>
      updateProject(userId, projectId, data),
    onSuccess: (_data, { userId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(userId, projectId) })
    },
  })
}
