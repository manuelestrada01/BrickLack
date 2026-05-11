import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getFriends, getReceivedFriendRequests, getSentFriendRequests } from '@/lib/firestore/friends'

export function useFriends(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId ?? ''),
    queryFn: () => getFriends(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useReceivedFriendRequests(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.received(userId ?? ''),
    queryFn: () => getReceivedFriendRequests(userId!),
    enabled: !!userId,
    staleTime: 0,
  })
}

export function useSentFriendRequests(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.sent(userId ?? ''),
    queryFn: () => getSentFriendRequests(userId!),
    enabled: !!userId,
    staleTime: 0,
  })
}
