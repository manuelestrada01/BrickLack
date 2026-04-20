import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { updatePieceQuantity } from '@/lib/firestore/pieces'
import { updateProject } from '@/lib/firestore/projects'
import type { ProjectPiece } from '@/types'

interface TogglePieceInput {
  userId: string
  projectId: string
  pieceId: string
  quantityFound: number
  quantityRequired: number
}

export function useTogglePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, projectId, pieceId, quantityFound, quantityRequired }: TogglePieceInput) =>
      updatePieceQuantity(userId, projectId, pieceId, quantityFound, quantityFound >= quantityRequired),

    onMutate: async ({ userId, projectId, pieceId, quantityFound, quantityRequired }) => {
      const piecesKey = queryKeys.projects.pieces(userId, projectId)

      await queryClient.cancelQueries({ queryKey: piecesKey })
      const previousPieces = queryClient.getQueryData<ProjectPiece[]>(piecesKey)

      // Actualización optimista — la UI responde de inmediato
      queryClient.setQueryData<ProjectPiece[]>(piecesKey, (old) =>
        old?.map((p) =>
          p.id === pieceId
            ? { ...p, quantityFound, isComplete: quantityFound >= quantityRequired }
            : p,
        ) ?? [],
      )

      return { previousPieces }
    },

    onError: (_err, { userId, projectId }, context) => {
      // Rollback si falla la escritura en Firestore
      if (context?.previousPieces) {
        queryClient.setQueryData(
          queryKeys.projects.pieces(userId, projectId),
          context.previousPieces,
        )
      }
    },

    onSettled: async (_data, _err, { userId, projectId }) => {
      // Recalcular foundPieces en el doc del proyecto
      const pieces = queryClient.getQueryData<ProjectPiece[]>(
        queryKeys.projects.pieces(userId, projectId),
      )
      if (pieces) {
        const foundPieces = pieces.reduce((sum, p) => sum + p.quantityFound, 0)
        await updateProject(userId, projectId, { foundPieces })
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.pieces(userId, projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(userId, projectId) })
    },
  })
}
