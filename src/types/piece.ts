export interface PieceDoc {
  partNum: string
  name: string
  color: string
  colorCode: string
  imageUrl: string
  quantityRequired: number
  quantityFound: number
  isComplete: boolean
}

export interface ProjectPiece extends PieceDoc {
  id: string
}

export interface PieceIdentification {
  type: string
  color: string
  dimensions: string
  partNum: string | null
  confidence: 'high' | 'medium' | 'low'
  knownSets: string[]
}
