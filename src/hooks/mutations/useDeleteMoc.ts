import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { deleteMoc } from '@/lib/firestore/mocs'
import { deleteMocCoverImage } from '@/lib/storage'

interface DeleteMocInput {
  mocId: string
  imageUrl: string
}

export function useDeleteMoc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ mocId, imageUrl }: DeleteMocInput) => {
      await deleteMoc(mocId)
      if (imageUrl) {
        try {
          await deleteMocCoverImage(imageUrl)
        } catch {
          // Si la imagen ya no existe no es crítico
        }
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() })
    },
  })
}
