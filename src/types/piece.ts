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
  partNum: string
  name: string
  imgUrl: string
  score: number
}
