export interface RebrickableSet {
  set_num: string
  name: string
  year: number
  theme_id: number
  num_parts: number
  set_img_url: string | null
  set_url: string
  last_modified_dt: string
}

export interface RebrickablePart {
  id: number
  inv_part_id: number
  part: {
    part_num: string
    name: string
    part_cat_id: number
    part_url: string
    part_img_url: string | null
    external_ids: Record<string, string[]>
    print_of: string | null
  }
  color: {
    id: number
    name: string
    rgb: string
    is_trans: boolean
  }
  set_num: string
  quantity: number
  is_spare: boolean
  element_id: string
  num_sets: number
}

export interface RebrickablePartDetail {
  part_num: string
  name: string
  part_cat_id: number
  year_from: number
  year_to: number
  part_url: string
  part_img_url: string | null
  external_ids: Record<string, string[]>
  print_of: string | null
}

export interface RebrickableColor {
  id: number
  name: string
  rgb: string
  is_trans: boolean
  external_ids: Record<string, unknown>
}

export interface RebrickablePaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
