import { auth } from '@/config/firebase'
import type { IdentifyPieceResponse, SuggestSetsResponse } from '@/types'

// En desarrollo con el emulador: http://localhost:5001/{projectId}/us-central1
// En producción: https://us-central1-{projectId}.cloudfunctions.net
const FUNCTIONS_BASE_URL =
  import.meta.env.VITE_FUNCTIONS_URL ?? 'https://us-central1-bricklack.cloudfunctions.net'

async function callFunction<TPayload, TResponse>(
  name: string,
  payload: TPayload,
): Promise<TResponse> {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Usuario no autenticado')

  const response = await fetch(`${FUNCTIONS_BASE_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(
      (errorBody as { error?: string }).error ?? `Function ${name} failed: ${response.status}`,
    )
  }

  return response.json() as Promise<TResponse>
}

export async function callIdentifyPiece(imageBase64: string): Promise<IdentifyPieceResponse> {
  return callFunction<{ imageBase64: string }, IdentifyPieceResponse>('identifyPiece', {
    imageBase64,
  })
}

export async function callSuggestSets(
  pieces: Array<{ partNum: string; color: string; quantity: number }>,
): Promise<SuggestSetsResponse> {
  return callFunction<
    { pieces: Array<{ partNum: string; color: string; quantity: number }> },
    SuggestSetsResponse
  >('suggestSets', { pieces })
}
