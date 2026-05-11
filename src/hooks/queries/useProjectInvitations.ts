import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import {
  getReceivedProjectInvitations,
  getSentProjectInvitations,
} from '@/lib/firestore/projectInvitations'

export function useReceivedProjectInvitations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invitations.received(userId ?? ''),
    queryFn: () => getReceivedProjectInvitations(userId!),
    enabled: !!userId,
    staleTime: 0,
  })
}

export function useProjectSentInvitations(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invitations.project(projectId ?? ''),
    queryFn: () => getSentProjectInvitations(projectId!),
    enabled: !!projectId,
    staleTime: 0,
  })
}
