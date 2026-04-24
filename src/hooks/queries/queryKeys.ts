export const queryKeys = {
  sets: {
    search: (query: string) => ['sets', 'search', query] as const,
    detail: (setId: string) => ['sets', 'detail', setId] as const,
    parts: (setId: string) => ['sets', 'parts', setId] as const,
  },
  pieces: {
    search: (query: string) => ['pieces', 'search', query] as const,
    detail: (partNum: string) => ['pieces', 'detail', partNum] as const,
  },
  projects: {
    all: (userId: string) => ['projects', userId] as const,
    detail: (userId: string, projectId: string) => ['projects', userId, projectId] as const,
    pieces: (userId: string, projectId: string) =>
      ['projects', userId, projectId, 'pieces'] as const,
  },
  users: {
    profile: (userId: string) => ['users', userId] as const,
  },
  community: {
    all: () => ['community'] as const,
    detail: (mocId: string) => ['community', mocId] as const,
    pieces: (mocId: string) => ['community', mocId, 'pieces'] as const,
    like: (mocId: string, userId: string) => ['community', mocId, 'likes', userId] as const,
  },
} as const
