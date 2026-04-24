import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { toggleLikeMoc } from '@/lib/firestore/mocs'
import type { Moc } from '@/types'

interface LikeMocInput {
  mocId: string
  userId: string
  currentlyLiked: boolean
}

export function useLikeMoc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mocId, userId, currentlyLiked }: LikeMocInput) =>
      toggleLikeMoc(mocId, userId, currentlyLiked),

    onMutate: async ({ mocId, userId, currentlyLiked }) => {
      const likeKey = queryKeys.community.like(mocId, userId)
      const detailKey = queryKeys.community.detail(mocId)

      await queryClient.cancelQueries({ queryKey: likeKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const prevLiked = queryClient.getQueryData<boolean>(likeKey)
      const prevMoc = queryClient.getQueryData<Moc>(detailKey)

      queryClient.setQueryData<boolean>(likeKey, !currentlyLiked)
      queryClient.setQueryData<Moc | undefined>(detailKey, (old) =>
        old
          ? { ...old, likeCount: old.likeCount + (currentlyLiked ? -1 : 1) }
          : old,
      )

      return { prevLiked, prevMoc }
    },

    onError: (_err, { mocId, userId }, ctx) => {
      if (ctx) {
        queryClient.setQueryData(queryKeys.community.like(mocId, userId), ctx.prevLiked)
        queryClient.setQueryData(queryKeys.community.detail(mocId), ctx.prevMoc)
      }
    },

    onSettled: (_data, _err, { mocId }) => {
      // exact: true prevents prefix-matching the like query and triggering a refetch
      // that could return a stale value and override the optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(mocId), exact: true })
    },
  })
}
