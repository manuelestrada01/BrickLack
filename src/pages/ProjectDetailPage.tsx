import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useProjectRealtime } from '@/hooks/queries/useProjectRealtime'
import { useProjectPiecesRealtime } from '@/hooks/queries/useProjectPiecesRealtime'
import { useProjectSentInvitations } from '@/hooks/queries/useProjectInvitations'
import { useFriends } from '@/hooks/queries/useFriends'
import { useTogglePiece } from '@/hooks/mutations/useTogglePiece'
import { useSendProjectInvitation, useCancelProjectInvitation } from '@/hooks/mutations/useProjectInvitationActions'
import { useAssignPieces, useReassignPiece, distributeEqually } from '@/hooks/mutations/useAssignPieces'
import { useRemoveProjectMember } from '@/hooks/mutations/useRemoveProjectMember'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProjectScanModal } from '@/components/project/ProjectScanModal'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { ProjectPiece, ProjectMember, Friend } from '@/types'

// ─── Piece Card ───────────────────────────────────────────────────────────────

function PieceCard({
  piece, projectId, members, justUpdated,
}: {
  piece: ProjectPiece
  projectId: string
  members: ProjectMember[]
  justUpdated?: boolean
}) {
  const toggle = useTogglePiece()
  const reassign = useReassignPiece()
  const cardRef = useRef<HTMLDivElement>(null)
  const colorHex = piece.colorCode ? `#${piece.colorCode}` : '#aaa'
  const found = piece.quantityFound
  const required = piece.quantityRequired
  const done = piece.isComplete
  const isCollaborative = members.length > 1

  const assignedMember = members.find(m => m.userId === piece.assignedTo)

  // Flash when another member updates this piece
  useEffect(() => {
    if (!justUpdated || !cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { boxShadow: '0 0 0 2px #FFD700' },
      { boxShadow: '0 0 0 0px #FFD700', duration: 1, ease: 'power2.out' },
    )
  }, [justUpdated])

  const mutate = (qty: number) =>
    toggle.mutate({ projectId, pieceId: piece.id, quantityFound: qty, quantityRequired: required })

  // Cycle through members on click: unassigned → m[0] → m[1] → ... → unassigned
  const cycleAssignee = () => {
    if (!isCollaborative) return
    const idx = members.findIndex(m => m.userId === piece.assignedTo)
    const next = idx === -1 ? members[0].userId : idx === members.length - 1 ? null : members[idx + 1].userId
    reassign.mutate({ projectId, pieceId: piece.id, assignedTo: next })
  }

  return (
    <div ref={cardRef} className={`relative flex flex-col rounded-xl border overflow-hidden select-none transition-colors ${done ? 'bg-green-50/60 border-green-200' : 'bg-white border-navy/10'}`}>
      {/* Checkbox */}
      <div
        onClick={() => mutate(done ? 0 : required)}
        className={`absolute top-2 right-2 w-5 h-5 rounded border flex items-center justify-center z-10 cursor-pointer transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-navy/20 bg-white/90 hover:border-navy/40'}`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>

      {/* Assignee badge (collaborative projects only) */}
      {isCollaborative && (
        <button
          onClick={cycleAssignee}
          disabled={reassign.isPending}
          title={assignedMember ? `Assigned to ${assignedMember.displayName} — click to change` : 'Unassigned — click to assign'}
          className="absolute top-2 left-2 z-10 transition-opacity hover:opacity-80"
        >
          {assignedMember ? (
            <Avatar src={assignedMember.photoURL} name={assignedMember.displayName} size="xs" />
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-navy/25 bg-white/80 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-navy/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </div>
          )}
        </button>
      )}

      {/* Image */}
      <div className="w-full aspect-square bg-navy/[0.04] flex items-center justify-center overflow-hidden">
        {piece.imageUrl
          ? <img src={piece.imageUrl} alt={piece.name} className={`w-full h-full object-contain p-3 transition-opacity ${done ? 'opacity-40' : ''}`} loading="lazy" />
          : <div className="w-8 h-8 rounded bg-navy/10" />
        }
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2 pb-1.5 flex-1 space-y-0.5">
        <p className={`text-xs leading-snug line-clamp-2 font-medium ${done ? 'text-navy/35 line-through' : 'text-navy'}`}>{piece.name}</p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-navy/10 flex-shrink-0" style={{ backgroundColor: colorHex }} />
          <span className="text-[10px] text-navy/50 truncate">{piece.color}</span>
        </div>
        <p className="font-mono text-[10px] text-navy/35">{piece.partNum}</p>
      </div>

      {/* Counter */}
      <div className="flex items-center border-t border-navy/8">
        <button onClick={() => found > 0 && mutate(found - 1)} disabled={found <= 0}
          className="flex-1 py-2 flex items-center justify-center hover:bg-navy/5 disabled:opacity-20 transition-colors"
          style={{ color: '#000000' }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
        <div className="px-2 py-2 border-x border-navy/8 flex items-baseline gap-0.5">
          <span className="font-mono text-sm font-semibold leading-none" style={{ color: done ? '#22C55E' : '#000000' }}>{found}</span>
          <span className="font-mono text-[10px] leading-none" style={{ color: '#000000' }}>/{required}</span>
        </div>
        <button onClick={() => found < required && mutate(found + 1)} disabled={found >= required}
          className="flex-1 py-2 flex items-center justify-center hover:bg-navy/5 disabled:opacity-20 transition-colors"
          style={{ color: '#000000' }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
    </div>
  )
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({
  isOpen, onClose,
  project,
  members, pendingInviteUserIds,
  currentUser,
}: {
  isOpen: boolean
  onClose: () => void
  project: { id: string; name: string; imageUrl: string | null }
  members: ProjectMember[]
  pendingInviteUserIds: string[]
  currentUser: { userId: string; displayName: string }
}) {
  const { data: friends = [], isLoading } = useFriends(currentUser.userId)
  const sendInvite = useSendProjectInvitation()
  const [sent, setSent] = useState<Set<string>>(new Set())
  // React controls mounting; GSAP only animates
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSent(new Set())
      setMounted(true)
    }
  }, [isOpen])

  // Animate in after mount
  useEffect(() => {
    if (!mounted || !isOpen) return
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(panelRef.current, { y: 20, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.5)' })
  }, [mounted, isOpen])

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.15,
      onComplete: () => { setMounted(false); onClose() },
    })
  }

  const memberIds = new Set(members.map(m => m.userId))
  const pendingIds = new Set(pendingInviteUserIds)

  const handleInvite = async (friend: Friend) => {
    await sendInvite.mutateAsync({ from: currentUser, to: { userId: friend.userId }, project })
    setSent(prev => new Set(prev).add(friend.userId))
  }

  const available = friends.filter(f => !memberIds.has(f.userId) && !pendingIds.has(f.userId))

  if (!mounted) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
      onClick={e => { if (e.target === overlayRef.current) handleClose() }}
    >
      <div ref={panelRef} className="w-full max-w-sm bg-white rounded-2xl border border-navy/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy/8">
          <h2 className="font-display text-base font-semibold text-navy">Invite to project</h2>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-navy/5 text-navy/40 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-2">
          {isLoading && <div className="flex justify-center py-6"><Spinner size="lg" /></div>}
          {!isLoading && available.length === 0 && friends.length === 0 && (
            <p className="text-sm text-navy/40 font-body py-4 text-center">Add friends first to invite them.</p>
          )}
          {!isLoading && available.length === 0 && friends.length > 0 && (
            <p className="text-sm text-navy/40 font-body py-4 text-center">All friends are already members or invited.</p>
          )}
          {available.map(friend => {
            const isSent = sent.has(friend.userId)
            return (
              <div key={friend.userId} className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={friend.photoURL} name={friend.displayName} size="md" />
                  <p className="text-sm font-medium text-navy font-body truncate">{friend.displayName}</p>
                </div>
                <button
                  onClick={() => void handleInvite(friend)}
                  disabled={isSent || sendInvite.isPending}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold font-body transition-colors flex-shrink-0 flex items-center gap-1.5 ${
                    isSent
                      ? 'bg-navy/5 text-navy/40 cursor-default'
                      : 'bg-lego-yellow text-navy hover:bg-lego-yellow/80 disabled:opacity-40'
                  }`}
                >
                  {isSent ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-status-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                      Sent
                    </>
                  ) : 'Invite'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Members bar ──────────────────────────────────────────────────────────────

/** Shared member list content used in both the bottom sheet and the desktop dropdown */
function MemberList({
  members, ownerId, currentUserId, projectId, pieces,
  pendingIds, isOwner,
}: {
  members: ProjectMember[]
  ownerId: string
  currentUserId: string
  projectId: string
  pieces: ProjectPiece[]
  pendingIds: string[]
  isOwner: boolean
}) {
  const cancelInvite = useCancelProjectInvitation()
  const removeMember = useRemoveProjectMember()
  const isCollaborative = members.length > 1

  return (
    <div className="space-y-1">
      {members.map(member => {
        const assigned = pieces.filter(p => p.assignedTo === member.userId)
        const found = assigned.filter(p => p.isComplete).length
        const assignedCount = assigned.length
        const pct = assignedCount > 0 ? (found / assignedCount) * 100 : 0

        return (
          <div key={member.userId} className="py-2 px-1">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Avatar src={member.photoURL} name={member.displayName} size="md" />
                {member.userId === ownerId && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-lego-yellow rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <svg className="w-2 h-2 text-navy" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-navy font-body truncate">{member.displayName}</p>
                  {isCollaborative && assignedCount > 0 && (
                    <span className="font-mono text-xs text-navy/50 flex-shrink-0">
                      {found}<span className="text-navy/25">/{assignedCount}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-navy/40 font-body capitalize">{member.role}</p>
              </div>
              {isOwner && member.userId !== ownerId && (
                <button
                  onClick={() => removeMember.mutate({ projectId, memberIdToRemove: member.userId, currentUserId })}
                  disabled={removeMember.isPending}
                  title="Remove from project"
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-navy/25 hover:text-status-error hover:bg-status-error/10 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {isCollaborative && assignedCount > 0 && (
              <div className="mt-2 ml-[46px] mr-1">
                <div className="h-1 rounded-full bg-navy/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-lego-yellow transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {isOwner && pendingIds.map(toUserId => (
        <div key={toUserId} className="flex items-center gap-3 py-2 px-1 opacity-50">
          <div className="w-9 h-9 rounded-full border border-dashed border-navy/25 bg-navy/5 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-navy/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-navy/50 font-body">Pending invite</p>
          </div>
          <button
            onClick={() => cancelInvite.mutate({ projectId, toUserId })}
            disabled={cancelInvite.isPending}
            className="text-xs text-navy/35 hover:text-status-error transition-colors font-body flex-shrink-0 px-2 py-1 rounded-lg hover:bg-status-error/8"
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  )
}

/** Bottom sheet (mobile) — slides up from bottom via GSAP */
function TeamBottomSheet({
  isOpen, onClose,
  members, ownerId, currentUserId, projectId, pieces, pendingIds, isOwner,
  onInvite, onDistribute, isDistributing,
}: {
  isOpen: boolean
  onClose: () => void
  members: ProjectMember[]
  ownerId: string
  currentUserId: string
  projectId: string
  pieces: ProjectPiece[]
  pendingIds: string[]
  isOwner: boolean
  onInvite: () => void
  onDistribute?: () => void
  isDistributing?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  useEffect(() => {
    if (!mounted) return
    if (isOpen) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 })
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.3, ease: 'power3.out' })
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 })
      gsap.to(sheetRef.current, {
        y: '100%', duration: 0.22, ease: 'power2.in',
        onComplete: () => setMounted(false),
      })
    }
  }, [isOpen, mounted])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '85dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-navy/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-navy/8">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-navy/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h2 className="font-display text-base font-semibold text-navy">Team</h2>
            <span className="font-mono text-xs text-navy/40 bg-navy/6 px-2 py-0.5 rounded-full">
              {members.length + pendingIds.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-navy/35 hover:text-navy hover:bg-navy/6 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Members list */}
        <div className="px-4 py-2 overflow-y-auto" style={{ maxHeight: 'calc(85dvh - 180px)' }}>
          <MemberList
            members={members}
            ownerId={ownerId}
            currentUserId={currentUserId}
            projectId={projectId}
            pieces={pieces}
            pendingIds={pendingIds}
            isOwner={isOwner}
          />
        </div>

        {/* Action buttons */}
        <div className="px-4 pt-3 pb-6 flex gap-2 border-t border-navy/8 bg-white">
          {onDistribute && (
            <button
              onClick={() => { onDistribute(); onClose() }}
              disabled={isDistributing}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl border border-navy/12 text-navy/60 text-sm font-body font-medium hover:border-navy/25 hover:text-navy hover:bg-navy/[0.03] disabled:opacity-30 transition-all"
            >
              {isDistributing
                ? <Spinner size="sm" />
                : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
                  </svg>
              }
              Distribute
            </button>
          )}
          <button
            onClick={() => { onClose(); onInvite() }}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-lego-yellow text-navy text-sm font-body font-semibold hover:bg-lego-yellow/85 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Invite
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Desktop dropdown panel anchored below the trigger */
function TeamDropdown({
  isOpen, members, ownerId, currentUserId, projectId, pieces, pendingIds, isOwner,
  containerRef,
}: {
  isOpen: boolean
  members: ProjectMember[]
  ownerId: string
  currentUserId: string
  projectId: string
  pieces: ProjectPiece[]
  pendingIds: string[]
  isOwner: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panelRef.current) return
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      gsap.set(panelRef.current, {
        display: 'block',
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 280 - 16),
      })
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: -6, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'back.out(1.5)' },
      )
    } else {
      gsap.to(panelRef.current, {
        opacity: 0, y: -4, scale: 0.97, duration: 0.12, ease: 'power2.in',
        onComplete: () => gsap.set(panelRef.current, { display: 'none' }),
      })
    }
  }, [isOpen, containerRef])

  return createPortal(
    <div
      ref={panelRef}
      style={{ display: 'none', position: 'fixed', zIndex: 40 }}
      className="bg-white rounded-2xl border border-navy/10 shadow-2xl p-4 w-[280px]"
    >
      <MemberList
        members={members}
        ownerId={ownerId}
        currentUserId={currentUserId}
        projectId={projectId}
        pieces={pieces}
        pendingIds={pendingIds}
        isOwner={isOwner}
      />
    </div>,
    document.body,
  )
}

function MembersBar({
  members, ownerId, currentUserId, projectId,
  project, pieces,
  onDistribute, isDistributing,
}: {
  members: ProjectMember[]
  ownerId: string
  currentUserId: string
  projectId: string
  project: { id: string; name: string; imageUrl: string | null }
  pieces: ProjectPiece[]
  onDistribute?: () => void
  isDistributing?: boolean
}) {
  const { data: pendingInvites = [] } = useProjectSentInvitations(projectId)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isOwner = currentUserId === ownerId
  const isMobile = useIsMobile()

  const pendingIds = pendingInvites.map(i => i.toUserId)
  const totalCount = members.length + pendingIds.length

  // Close dropdown on outside click (desktop only)
  useEffect(() => {
    if (!expanded || isMobile) return
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setExpanded(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [expanded, isMobile])

  const MAX_VISIBLE = 4
  const visibleMembers = members.slice(0, MAX_VISIBLE)
  const overflow = members.length - MAX_VISIBLE

  return (
    <div ref={containerRef} className="relative flex flex-col h-full">

      {/* ── Clickable trigger: header + avatars ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex flex-col items-center w-full flex-1 pt-4 pb-3 px-4 cursor-pointer"
      >
        <div className="flex items-center justify-center gap-2 pb-2 w-full">
          <span className="text-[10px] font-semibold text-navy/35 font-body tracking-[0.12em] uppercase">Team</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors ${expanded && !isMobile ? 'bg-navy text-white' : 'bg-navy/6 text-navy/50'}`}>
            {totalCount}
            <svg className={`w-2.5 h-2.5 transition-transform duration-200 ${expanded && !isMobile ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>

        {/* Avatar stack */}
        <div className="flex items-center">
          {visibleMembers.map((member, i) => (
            <div
              key={member.userId}
              className="relative rounded-full ring-2 ring-white transition-transform hover:-translate-y-0.5"
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: visibleMembers.length - i }}
              title={`${member.displayName} — ${member.role}`}
            >
              <Avatar src={member.photoURL} name={member.displayName} size="md" />
              {member.userId === ownerId && (
                <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-lego-yellow rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <svg className="w-2 h-2 text-navy" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </span>
              )}
            </div>
          ))}
          {overflow > 0 && (
            <div className="w-9 h-9 rounded-full ring-2 ring-white bg-navy/8 flex items-center justify-center" style={{ marginLeft: -10 }}>
              <span className="text-[10px] font-mono font-bold text-navy/50">+{overflow}</span>
            </div>
          )}
          {pendingIds.slice(0, 2).map((_, i) => (
            <div
              key={`pending-${i}`}
              className="w-9 h-9 rounded-full ring-2 ring-white border border-dashed border-navy/20 bg-navy/[0.03] flex items-center justify-center opacity-50"
              style={{ marginLeft: -10, zIndex: 0 }}
              title="Invite pending"
            >
              <svg className="w-3 h-3 text-navy/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </div>
          ))}
        </div>
      </button>

      {/* ── Action buttons (visible on desktop; hidden on mobile — actions live in bottom sheet) ── */}
      <div className="hidden sm:flex px-3 pb-3 gap-1.5">
        {onDistribute && (
          <button
            onClick={onDistribute}
            disabled={isDistributing}
            title="Distribute pieces evenly among all members"
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-navy/10 text-navy/40 text-[11px] font-body font-medium hover:border-navy/20 hover:text-navy/70 hover:bg-navy/[0.04] disabled:opacity-30 transition-all duration-200"
          >
            {isDistributing ? <Spinner size="sm" /> : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            )}
            Distribute
          </button>
        )}
        <button
          onClick={() => setInviteOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-dashed border-navy/15 text-navy/35 text-[11px] font-body font-medium hover:border-lego-yellow/50 hover:text-navy/70 hover:bg-lego-yellow/[0.06] transition-all duration-200 group"
        >
          <svg className="w-3 h-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Invite
        </button>
      </div>

      {/* Mobile: bottom sheet */}
      {isMobile && (
        <TeamBottomSheet
          isOpen={expanded}
          onClose={() => setExpanded(false)}
          members={members}
          ownerId={ownerId}
          currentUserId={currentUserId}
          projectId={projectId}
          pieces={pieces}
          pendingIds={pendingIds}
          isOwner={isOwner}
          onInvite={() => setInviteOpen(true)}
          onDistribute={isOwner ? onDistribute : undefined}
          isDistributing={isDistributing}
        />
      )}

      {/* Desktop: positioned dropdown */}
      {!isMobile && (
        <TeamDropdown
          isOpen={expanded}
          members={members}
          ownerId={ownerId}
          currentUserId={currentUserId}
          projectId={projectId}
          pieces={pieces}
          pendingIds={pendingIds}
          isOwner={isOwner}
          containerRef={containerRef}
        />
      )}

      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        project={project}
        members={members}
        pendingInviteUserIds={pendingIds}
        currentUser={{ userId: currentUserId, displayName: '' }}
      />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const GRID = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: project } = useProjectRealtime(projectId)
  const { data: pieces, updatedIds } = useProjectPiecesRealtime(projectId)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'missing' | 'found' | 'mine'>('all')
  const [scanOpen, setScanOpen] = useState(false)
  const autoAssign = useAssignPieces()

  const headerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const animatedProject = useRef(false)
  const animatedPieces = useRef(false)

  useEffect(() => {
    if (project && !animatedProject.current) {
      animatedProject.current = true
      gsap.fromTo(
        [headerRef.current, progressRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
      )
    }
  }, [project])

  useEffect(() => {
    if (pieces && !animatedPieces.current) {
      animatedPieces.current = true
      gsap.fromTo(
        listRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.15 },
      )
      const cards = gridRef.current?.children
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { y: 20, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.02, ease: 'power3.out', clearProps: 'transform,opacity', delay: 0.25 },
        )
      }
    }
  }, [pieces])

  const progress = project && project.totalPieces > 0 ? (project.foundPieces / project.totalPieces) * 100 : 0
  const remaining = project ? project.totalPieces - project.foundPieces : 0

  const members = project?.members ?? []
  const isCollaborative = members.length > 1
  const isOwner = user && project ? user.uid === project.ownerId : false

  const filtered = (pieces ?? []).filter((p) => {
    const q = search.toLowerCase()
    const match = p.name.toLowerCase().includes(q) || p.partNum.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
    if (filter === 'missing') return match && !p.isComplete
    if (filter === 'found') return match && p.isComplete
    if (filter === 'mine') return match && p.assignedTo === user?.uid
    return match
  })

  const statusLabel = project?.status === 'in_progress'
    ? t('project.status.inProgress')
    : project?.status === 'paused'
    ? t('project.status.paused')
    : t('project.status.completed')

  const FILTERS = [
    { key: 'all' as const,     label: t('project.filterAll') },
    { key: 'missing' as const, label: t('project.filterMissing') },
    { key: 'found' as const,   label: t('project.filterFound') },
    ...(isCollaborative ? [{ key: 'mine' as const, label: 'Mine' }] : []),
  ]

  const handleAutoDistribute = () => {
    if (!pieces || !project) return
    const memberIds = members.map(m => m.userId)
    const assignments = distributeEqually(pieces, memberIds)
    autoAssign.mutate({ projectId: project.id, assignments })
  }

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Header ── */}
      {project && (
        <div ref={headerRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left" style={{ opacity: 0 }}>
          {project.setImageUrl && (
            <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-navy/10 bg-white overflow-hidden flex items-center justify-center">
              <img src={project.setImageUrl} alt={project.name} className="w-full h-full object-contain p-1" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-navy/85 text-lego-yellow border-transparent font-body">
                {statusLabel}
              </span>
              {/* Live indicator — shown for collaborative projects */}
              {members.length > 1 && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-status-success/80">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-status-success" />
                  </span>
                  Live
                </span>
              )}
              {project.setId && <span className="text-sm text-navy/40 font-mono">{project.setId}</span>}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy leading-tight">{project.name}</h1>
            {project.setId && (
              <a
                href={`https://www.lego.com/en-us/service/buildinginstructions/${project.setId.split('-')[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/50 hover:text-navy transition-colors group"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {t('project.buildingInstructions')}
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Progress + Members ── */}
      {project && (
        <div ref={progressRef} className="flex flex-col sm:flex-row gap-3" style={{ opacity: 0 }}>
          {/* Progress card */}
          <div className="flex-1 p-5 rounded-xl border border-navy/8 bg-white space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-navy/40 font-body uppercase tracking-wider">{t('project.progress')}</p>
                <p className="font-mono text-3xl font-bold text-lego-yellow mt-0.5">{Math.round(progress)}%</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-navy">
                  {project.foundPieces.toLocaleString()}
                  <span className="text-navy/30 font-normal text-sm"> / {project.totalPieces.toLocaleString()}</span>
                </p>
                <p className="text-xs text-navy/40 font-body mt-0.5">
                  {remaining > 0 ? `${remaining.toLocaleString()} ${t('project.remaining')}` : t('project.complete')}
                </p>
              </div>
            </div>
            <ProgressBar value={progress} size="md" />
          </div>

          {/* Team card */}
          {user && (
            <div className="rounded-xl border border-navy/8 bg-white overflow-visible min-w-[170px] flex flex-col">
              <MembersBar
                members={project.members}
                ownerId={project.ownerId}
                currentUserId={user.uid}
                projectId={project.id}
                project={{ id: project.id, name: project.name, imageUrl: project.setImageUrl }}
                pieces={pieces ?? []}
                onDistribute={isCollaborative && isOwner ? handleAutoDistribute : undefined}
                isDistributing={autoAssign.isPending}
              />
            </div>
          )}
        </div>
      )}

      {!pieces && <div className="w-full min-h-[40vh]" />}

      {/* ── Piece list ── */}
      {pieces && (
        <div ref={listRef} className="space-y-4" style={{ opacity: 0 }}>
          <div className="border-t border-navy/8" />

          {/* ── Section header ── */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-navy">{t('project.pieceList')}</h2>
            <button
              onClick={() => setScanOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-navy text-white text-xs font-body font-semibold hover:bg-navy/85 active:scale-95 transition-all flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{t('project.scanPiece')}</span>
            </button>
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('project.filterPlaceholder')}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/25 outline-none focus:border-lego-yellow/40 transition-colors"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Filter tabs + distribute */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-navy/8">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-body transition-colors ${
                    filter === f.key
                      ? 'bg-lego-yellow text-navy font-semibold'
                      : 'text-navy/45 hover:text-navy'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs font-mono text-navy/35">{filtered.length} {t('project.piecesOf')} {pieces.length} {t('project.pieces')}</p>

          {filtered.length === 0
            ? <p className="py-12 text-center text-sm text-navy/30">{t('project.noMatch')}</p>
            : <div ref={gridRef} className={GRID}>
                {filtered.map(piece => (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    projectId={projectId!}
                    members={members}
                    justUpdated={updatedIds.has(piece.id)}
                  />
                ))}
              </div>
          }
        </div>
      )}

      {pieces && (
        <ProjectScanModal
          isOpen={scanOpen}
          onClose={() => setScanOpen(false)}
          pieces={pieces}
          projectId={projectId!}
        />
      )}
    </div>
  )
}
