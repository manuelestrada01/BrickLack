export interface PieceDoc {
  partNum: string
  name: string
  color: string
  colorCode: string
  imageUrl: string
  quantityRequired: number
  quantityFound: number
  isComplete: boolean
  assignedTo: string | null    // userId of assigned collaborator, null = unassigned
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
