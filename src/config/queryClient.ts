import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('[Query error]', error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('[Mutation error]', error)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
