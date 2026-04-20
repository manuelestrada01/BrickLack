export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  SET_DETAIL: '/set/:setId',
  PIECE_DETAIL: '/piece/:partNum',
  DASHBOARD: '/dashboard',
  PROJECT_DETAIL: '/project/:projectId',
  NEW_PROJECT: '/project/new',
  IDENTIFY: '/identify',
} as const

export const buildSetPath = (setId: string) => `/set/${setId}`
export const buildPiecePath = (partNum: string) => `/piece/${partNum}`
export const buildProjectPath = (projectId: string) => `/project/${projectId}`
export const buildSearchPath = (query: string) => `/search?q=${encodeURIComponent(query)}`
