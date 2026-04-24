import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { cloneMocToProject } from '@/lib/firestore/mocs'

interface CloneMocInput {
  mocId: string
  userId: string
  userName: string
}

export function useCloneMoc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mocId, userId, userName }: CloneMocInput) =>
      cloneMocToProject(mocId, userId, userName),

    onSuccess: (_projectId, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() })
    },
  })
}
