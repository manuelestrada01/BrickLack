import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { removeProjectMember } from '@/lib/firestore/projects'

interface RemoveMemberInput {
  projectId: string
  memberIdToRemove: string
  currentUserId: string
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, memberIdToRemove }: RemoveMemberInput) =>
      removeProjectMember(projectId, memberIdToRemove),
    onSuccess: (_data, { projectId, currentUserId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(currentUserId) })
    },
  })
}
