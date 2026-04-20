import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { deleteProject } from '@/lib/firestore/projects'

interface DeleteProjectInput {
  userId: string
  projectId: string
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId }: DeleteProjectInput) =>
      deleteProject(userId, projectId),
    onSuccess: (_data, { userId, projectId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(userId, projectId) })
      queryClient.removeQueries({ queryKey: queryKeys.projects.pieces(userId, projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(userId) })
    },
  })
}
