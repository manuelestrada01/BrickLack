import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import {
  sendProjectInvitation,
  acceptProjectInvitation,
  rejectProjectInvitation,
  cancelProjectInvitation,
} from '@/lib/firestore/projectInvitations'

// ─── Send ─────────────────────────────────────────────────────────────────────

interface SendInput {
  from: { userId: string; displayName: string }
  to: { userId: string }
  project: { id: string; name: string; imageUrl: string | null }
}

export function useSendProjectInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ from, to, project }: SendInput) =>
      sendProjectInvitation(from, to, project),
    onSuccess: (_id, { project }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.project(project.id) })
    },
  })
}

// ─── Accept ───────────────────────────────────────────────────────────────────

interface AcceptInput {
  invitationId: string
  projectId: string
  user: { userId: string; displayName: string; photoURL: string }
}

export function useAcceptProjectInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, user }: AcceptInput) =>
      acceptProjectInvitation(invitationId, user),
    onSuccess: (_data, { user, projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.received(user.userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(user.userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
    },
  })
}

// ─── Reject ───────────────────────────────────────────────────────────────────

interface RejectInput {
  invitationId: string
  userId: string
}

export function useRejectProjectInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId }: RejectInput) => rejectProjectInvitation(invitationId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.received(userId) })
    },
  })
}

// ─── Cancel (owner withdraws invite) ─────────────────────────────────────────

interface CancelInput {
  projectId: string
  toUserId: string
}

export function useCancelProjectInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, toUserId }: CancelInput) =>
      cancelProjectInvitation(projectId, toUserId),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.project(projectId) })
    },
  })
}
