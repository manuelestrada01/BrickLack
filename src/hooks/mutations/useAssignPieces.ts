import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { assignPieces } from '@/lib/firestore/pieces'
import type { ProjectPiece } from '@/types'

// ─── Auto-distribute ──────────────────────────────────────────────────────────
// Round-robin assignment across members, only for incomplete pieces.
// Complete pieces are unassigned (null) since they don't need work.

export function distributeEqually(
  pieces: ProjectPiece[],
  memberIds: string[],
): { pieceId: string; assignedTo: string | null }[] {
  if (memberIds.length === 0) return pieces.map(p => ({ pieceId: p.id, assignedTo: null }))

  const incomplete = pieces.filter(p => !p.isComplete)
  const complete = pieces.filter(p => p.isComplete)

  const assignments: { pieceId: string; assignedTo: string | null }[] = []

  // Round-robin over incomplete pieces
  incomplete.forEach((piece, i) => {
    assignments.push({ pieceId: piece.id, assignedTo: memberIds[i % memberIds.length] })
  })

  // Complete pieces unassigned
  complete.forEach(piece => {
    assignments.push({ pieceId: piece.id, assignedTo: null })
  })

  return assignments
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

interface AssignInput {
  projectId: string
  assignments: { pieceId: string; assignedTo: string | null }[]
}

export function useAssignPieces() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, assignments }: AssignInput) =>
      assignPieces(projectId, assignments),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.pieces(projectId) })
    },
  })
}

// ─── Single piece reassign ────────────────────────────────────────────────────

interface ReassignInput {
  projectId: string
  pieceId: string
  assignedTo: string | null
}

export function useReassignPiece() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, pieceId, assignedTo }: ReassignInput) =>
      assignPieces(projectId, [{ pieceId, assignedTo }]),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.pieces(projectId) })
    },
  })
}
