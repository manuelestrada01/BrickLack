import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { updatePieceQuantity } from '@/lib/firestore/pieces'
import { updateProject } from '@/lib/firestore/projects'
import type { ProjectPiece } from '@/types'

interface TogglePieceInput {
  projectId: string
  pieceId: string
  quantityFound: number
  quantityRequired: number
}

export function useTogglePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, pieceId, quantityFound, quantityRequired }: TogglePieceInput) =>
      updatePieceQuantity(projectId, pieceId, quantityFound, quantityFound >= quantityRequired),

    onMutate: async ({ projectId, pieceId, quantityFound, quantityRequired }) => {
      const piecesKey = queryKeys.projects.pieces(projectId)

      await queryClient.cancelQueries({ queryKey: piecesKey })
      const previousPieces = queryClient.getQueryData<ProjectPiece[]>(piecesKey)

      queryClient.setQueryData<ProjectPiece[]>(piecesKey, (old) =>
        old?.map((p) =>
          p.id === pieceId
            ? { ...p, quantityFound, isComplete: quantityFound >= quantityRequired }
            : p,
        ) ?? [],
      )

      return { previousPieces }
    },

    onError: (_err, { projectId }, context) => {
      if (context?.previousPieces) {
        queryClient.setQueryData(
          queryKeys.projects.pieces(projectId),
          context.previousPieces,
        )
      }
    },

    onSettled: async (_data, _err, { projectId }) => {
      const pieces = queryClient.getQueryData<ProjectPiece[]>(
        queryKeys.projects.pieces(projectId),
      )
      if (pieces) {
        const foundPieces = pieces.reduce((sum, p) => sum + p.quantityFound, 0)
        await updateProject(projectId, { foundPieces })
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.pieces(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
    },
  })
}
