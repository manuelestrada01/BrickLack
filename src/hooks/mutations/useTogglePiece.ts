import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { updatePieceQuantity } from '@/lib/firestore/pieces'
import { incrementProjectFoundPieces } from '@/lib/firestore/projects'

interface TogglePieceInput {
  projectId: string
  pieceId: string
  quantityFound: number
  quantityRequired: number
  prevQuantityFound: number
}

export function useTogglePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, pieceId, quantityFound, quantityRequired, prevQuantityFound }: TogglePieceInput) => {
      const delta = quantityFound - prevQuantityFound
      await updatePieceQuantity(projectId, pieceId, quantityFound, quantityFound >= quantityRequired)
      await incrementProjectFoundPieces(projectId, delta)
    },

    onSettled: (_data, _err, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
    },
  })
}
