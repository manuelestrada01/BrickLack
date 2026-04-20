import type { PieceIdentification } from './piece'

export interface IdentifyPieceResponse {
  success: boolean
  data?: PieceIdentification
  error?: string
  remainingScans?: number
}

export interface SuggestSetsResponse {
  success: boolean
  suggestions?: Array<{
    setNum: string
    setName: string
    matchPercentage: number
    missingPieces: number
  }>
  error?: string
}
