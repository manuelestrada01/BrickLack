export const queryKeys = {
  sets: {
    search: (query: string) => ['sets', 'search', query] as const,
    detail: (setId: string) => ['sets', 'detail', setId] as const,
    parts: (setId: string) => ['sets', 'parts', setId] as const,
    subsets: (setId: string) => ['sets', 'subsets', setId] as const,
  },
  pieces: {
    search: (query: string) => ['pieces', 'search', query] as const,
    detail: (partNum: string) => ['pieces', 'detail', partNum] as const,
  },
  projects: {
    all: (userId: string) => ['projects', userId] as const,
    detail: (projectId: string) => ['projects', 'detail', projectId] as const,
    pieces: (projectId: string) => ['projects', 'detail', projectId, 'pieces'] as const,
  },
  users: {
    profile: (userId: string) => ['users', userId] as const,
  },
  friends: {
    list: (userId: string) => ['friends', userId, 'list'] as const,
    received: (userId: string) => ['friends', userId, 'received'] as const,
    sent: (userId: string) => ['friends', userId, 'sent'] as const,
  },
  invitations: {
    received: (userId: string) => ['invitations', userId, 'received'] as const,
    project: (projectId: string) => ['invitations', 'project', projectId] as const,
  },
  community: {
    all: () => ['community'] as const,
    detail: (mocId: string) => ['community', mocId] as const,
    pieces: (mocId: string) => ['community', mocId, 'pieces'] as const,
    like: (mocId: string, userId: string) => ['community', mocId, 'likes', userId] as const,
  },
} as const
