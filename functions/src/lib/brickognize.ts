export interface BrickognizeItem {
  id: string       // part_num, compatible con Rebrickable
  name: string
  img_url: string
  score: number    // 0–1
}

export async function callBrickognize(imageBuffer: Buffer, mimeType: string): Promise<BrickognizeItem | null> {
  const formData = new FormData()
  const blob = new Blob([imageBuffer], { type: mimeType })
  formData.append('query_image', blob, 'piece.jpg')

  const res = await fetch('https://api.brickognize.com/predict/', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Brickognize API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json() as { items?: BrickognizeItem[] }
  return data.items?.[0] ?? null
}
