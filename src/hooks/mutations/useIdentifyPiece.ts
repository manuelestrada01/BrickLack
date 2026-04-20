import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { callIdentifyPiece } from '@/lib/cloudFunctions'
import type { IdentifyPieceResponse } from '@/types'

export function useIdentifyPiece(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation<IdentifyPieceResponse, Error, string>({
    mutationFn: (imageBase64: string) => callIdentifyPiece(imageBase64),
    onSuccess: () => {
      // Refrescar el perfil para reflejar el scanCount actualizado
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId) })
      }
    },
  })
}
