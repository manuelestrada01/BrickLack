import type {
  RebrickableSet,
  RebrickablePart,
  RebrickablePartDetail,
  RebrickablePaginatedResponse,
  LegoSet,
  SetSearchResult,
} from '@/types'

const BASE_URL = 'https://rebrickable.com/api/v3/lego'

function getHeaders(): HeadersInit {
  return {
    Authorization: `key ${import.meta.env.VITE_REBRICKABLE_API_KEY}`,
  }
}

async function fetchRebrickable<T>(path: string): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const response = await fetch(url, { headers: getHeaders() })
  if (!response.ok) {
    throw new Error(`Rebrickable error: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

function normalizeSetNum(setId: string): string {
  return setId.includes('-') ? setId : `${setId}-1`
}

function mapSet(raw: RebrickableSet): LegoSet {
  return {
    setNum: raw.set_num,
    name: raw.name,
    year: raw.year,
    themeId: raw.theme_id,
    numParts: raw.num_parts,
    setImgUrl: raw.set_img_url,
    setUrl: raw.set_url,
    lastModifiedDt: raw.last_modified_dt,
  }
}

export async function searchSets(query: string, page = 1): Promise<SetSearchResult> {
  const params = new URLSearchParams({ search: query, page: String(page), page_size: '100' })
  const data = await fetchRebrickable<RebrickablePaginatedResponse<RebrickableSet>>(
    `/sets/?${params}`,
  )
  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: data.results.map(mapSet),
  }
}

export async function getSet(setId: string): Promise<LegoSet> {
  const data = await fetchRebrickable<RebrickableSet>(`/sets/${normalizeSetNum(setId)}/`)
  return mapSet(data)
}

// Fetches all parts, handling Rebrickable's pagination automatically
export async function getAllSetParts(setId: string): Promise<RebrickablePart[]> {
  const allParts: RebrickablePart[] = []
  let nextUrl: string | null =
    `${BASE_URL}/sets/${normalizeSetNum(setId)}/parts/?page_size=100&inc_spare_parts=0`

  while (nextUrl) {
    const page: RebrickablePaginatedResponse<RebrickablePart> =
      await fetchRebrickable<RebrickablePaginatedResponse<RebrickablePart>>(nextUrl)
    allParts.push(...page.results)
    nextUrl = page.next
  }

  return allParts
}

export async function getPart(partNum: string): Promise<RebrickablePartDetail> {
  return fetchRebrickable<RebrickablePartDetail>(`/parts/${partNum}/`)
}

export async function searchParts(
  searchQuery: string,
  page = 1,
): Promise<RebrickablePaginatedResponse<RebrickablePartDetail>> {
  const params = new URLSearchParams({
    search: searchQuery,
    page: String(page),
    page_size: '100',
  })
  return fetchRebrickable<RebrickablePaginatedResponse<RebrickablePartDetail>>(
    `/parts/?${params}`,
  )
}
