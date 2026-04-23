import type { IdentifyPieceResponse } from '@/types'

interface BrickognizeItem {
  id: string
  name: string
  img_url: string
  score: number
}

export async function identifyPiece(imageBase64: string): Promise<IdentifyPieceResponse> {
  // Strip data URL header if present
  let rawBase64 = imageBase64
  if (rawBase64.startsWith('data:')) {
    rawBase64 = rawBase64.split(',')[1]
  }

  const binary = atob(rawBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: 'image/jpeg' })

  const formData = new FormData()
  formData.append('query_image', blob, 'piece.jpg')

  const res = await fetch('https://api.brickognize.com/predict/', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Brickognize error: ${res.status}`)
  }

  const data = await res.json() as { items?: BrickognizeItem[] }
  const top = data.items?.[0]

  if (!top) {
    return { success: false, error: 'No piece found. Try a clearer photo.' }
  }

  return {
    success: true,
    data: {
      partNum: top.id,
      name: top.name,
      imgUrl: top.img_url,
      score: top.score,
    },
  }
}
