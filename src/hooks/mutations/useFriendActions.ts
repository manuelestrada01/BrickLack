import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  searchUserByFriendCode,
  hasPendingRequest,
} from '@/lib/firestore/friends'
import type { UserSearchResult } from '@/types'

// ─── Search ───────────────────────────────────────────────────────────────────

interface SearchInput {
  code: string
  currentUserId: string
}

export function useSearchUser() {
  return useMutation({
    mutationFn: ({ code, currentUserId }: SearchInput) =>
      searchUserByFriendCode(code, currentUserId),
  })
}

// ─── Send request ─────────────────────────────────────────────────────────────

interface SendRequestInput {
  fromUserId: string
  fromDisplayName: string
  fromPhotoURL: string
  to: UserSearchResult
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fromUserId, fromDisplayName, fromPhotoURL, to }: SendRequestInput) =>
      sendFriendRequest({ userId: fromUserId, displayName: fromDisplayName, photoURL: fromPhotoURL }, to),
    onSuccess: (_id, { fromUserId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.sent(fromUserId) })
    },
  })
}

// ─── Accept ───────────────────────────────────────────────────────────────────

interface AcceptInput {
  requestId: string
  userId: string   // the receiver (me) — to invalidate their queries
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId }: AcceptInput) => acceptFriendRequest(requestId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.received(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) })
    },
  })
}

// ─── Reject ───────────────────────────────────────────────────────────────────

interface RejectInput {
  requestId: string
  userId: string
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId }: RejectInput) => rejectFriendRequest(requestId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.received(userId) })
    },
  })
}

// ─── Cancel sent request ──────────────────────────────────────────────────────

interface CancelInput {
  requestId: string
  userId: string
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId }: CancelInput) => cancelFriendRequest(requestId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.sent(userId) })
    },
  })
}

// ─── Remove friend ────────────────────────────────────────────────────────────

interface RemoveInput {
  userId: string
  friendId: string
}

export function useRemoveFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, friendId }: RemoveInput) => removeFriend(userId, friendId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list(userId) })
    },
  })
}

export { hasPendingRequest }
