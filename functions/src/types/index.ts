// ─── Request / Response types shared between client and functions ─────────────

export interface IdentifyPieceRequest {
  imageBase64: string
}

export interface PieceIdentification {
  partNum: string
  name: string
  imgUrl: string
  score: number
}

export interface IdentifyPieceResponse {
  success: boolean
  data: PieceIdentification | null
  error?: string
}

export interface SuggestSetsRequest {
  pieces: Array<{
    partNum: string
    color: string
    quantity: number
  }>
}

export interface SetSuggestion {
  setNum: string
  setName: string
  matchPercentage: number
  missingPieces: string[]
  notes: string
}

export interface SuggestSetsResponse {
  success: boolean
  suggestions: SetSuggestion[]
  error?: string
}

export interface ModerateMocRequest {
  name: string
  description?: string
}

export interface ModerateMocResponse {
  allowed: boolean
  reason?: string
}

// Firestore user document shape (matches client types/user.ts)
export interface UserDoc {
  displayName: string
  email: string
  photoURL: string
  createdAt: FirebaseFirestore.Timestamp
  scanCount: number
  scanResetDate: FirebaseFirestore.Timestamp
}
