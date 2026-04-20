export interface LegoSet {
  setNum: string
  name: string
  year: number
  themeId: number
  numParts: number
  setImgUrl: string | null
  setUrl: string
  lastModifiedDt: string
}

export interface SetSearchResult {
  count: number
  next: string | null
  previous: string | null
  results: LegoSet[]
}

export interface SetCachePiece {
  partNum: string
  name: string
  color: string
  colorCode: string
  imageUrl: string
  quantity: number
}
