import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { createProject } from '@/lib/firestore/projects'
import { batchAddPieces } from '@/lib/firestore/pieces'
import { isCached, getCachedPieces, cacheSetPieces } from '@/lib/firestore/setCache'
import { getAllSetParts } from '@/lib/rebrickable'
import type { PieceDoc, SetCachePiece } from '@/types'

interface CreateProjectInput {
  userId: string
  name: string
  setId: string | null
  setName: string | null
  setImageUrl: string | null
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { userId, name, setId, setName, setImageUrl } = input

      let totalPieces = 0
      let pieceDocs: PieceDoc[] = []

      if (setId) {
        // Verificar caché antes de llamar a Rebrickable
        const cached = await isCached(setId)
        let cachePieces: SetCachePiece[]

        if (cached) {
          cachePieces = await getCachedPieces(setId)
        } else {
          const rawParts = await getAllSetParts(setId)
          cachePieces = rawParts.map((part) => ({
            partNum: part.part.part_num,
            name: part.part.name,
            color: part.color.name,
            colorCode: part.color.rgb,
            imageUrl: part.part.part_img_url ?? '',
            quantity: part.quantity,
          }))
          await cacheSetPieces(setId, cachePieces)
        }

        pieceDocs = cachePieces.map((piece) => ({
          partNum: piece.partNum,
          name: piece.name,
          color: piece.color,
          colorCode: piece.colorCode,
          imageUrl: piece.imageUrl,
          quantityRequired: piece.quantity,
          quantityFound: 0,
          isComplete: false,
        }))

        totalPieces = pieceDocs.reduce((sum, p) => sum + p.quantityRequired, 0)
      }

      const projectId = await createProject(userId, {
        name,
        setId,
        setName,
        setImageUrl,
        status: 'in_progress',
        totalPieces,
        foundPieces: 0,
      })

      if (pieceDocs.length > 0) {
        await batchAddPieces(userId, projectId, pieceDocs)
      }

      return projectId
    },

    onSuccess: (_projectId, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(userId) })
    },
  })
}
