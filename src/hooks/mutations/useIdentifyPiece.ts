import { useMutation } from '@tanstack/react-query'
import { identifyPiece } from '@/lib/brickognize'
import type { IdentifyPieceResponse } from '@/types'

export function useIdentifyPiece(_userId: string | undefined) {
  return useMutation<IdentifyPieceResponse, Error, string>({
    mutationFn: (imageBase64: string) => identifyPiece(imageBase64),
  })
}
