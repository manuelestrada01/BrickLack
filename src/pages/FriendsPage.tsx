import { useState, useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useFriends, useReceivedFriendRequests, useSentFriendRequests } from '@/hooks/queries/useFriends'
import { useReceivedProjectInvitations } from '@/hooks/queries/useProjectInvitations'
import {
  useSearchUser,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
} from '@/hooks/mutations/useFriendActions'
import {
  useAcceptProjectInvitation,
  useRejectProjectInvitation,
} from '@/hooks/mutations/useProjectInvitationActions'
import { isFriend, hasPendingRequest } from '@/lib/firestore/friends'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import type { UserSearchResult, Friend, FriendRequest, ProjectInvitation } from '@/types'

// ─── Search ───────────────────────────────────────────────────────────────────

function SearchSection({
  userId, displayName, photoURL, friendCode,
}: {
  userId: string; displayName: string; photoURL: string; friendCode: string
}) {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<UserSearchResult | null | 'not-found' | 'already-friend' | 'pending'>('not-found')
  const [searched, setSearched] = useState(false)

  const searchUser = useSearchUser()
  const sendRequest = useSendFriendRequest()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setSearched(false)
    const found = await searchUser.mutateAsync({ code, currentUserId: userId })
    if (!found) { setResult('not-found'); setSearched(true); return }

    const [alreadyFriend, pendingReq] = await Promise.all([
      isFriend(userId, found.uid),
      hasPendingRequest(userId, found.uid),
    ])
    if (alreadyFriend) { setResult('already-friend'); setSearched(true); return }
    if (pendingReq) { setResult('pending'); setSearched(true); return }
    setResult(found)
    setSearched(true)
  }

  const handleSend = async () => {
    if (!result || typeof result === 'string') return
    await sendRequest.mutateAsync({
      fromUserId: userId,
      fromDisplayName: displayName,
      fromPhotoURL: photoURL,
      to: result,
    })
    setResult('pending')
  }

  return (
    <div className="bg-white rounded-xl border border-navy/8 p-5 space-y-4">
      {/* Own friend code */}
      {friendCode && (
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-navy/8">
          <div>
            <p className="text-xs text-navy/40 font-body">Your friend code</p>
            <p className="font-mono text-xl font-bold text-navy tracking-wider mt-0.5">
              #{friendCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const text = `#${friendCode}`
              if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }).catch(() => {
                  // Fallback for browsers without clipboard permission
                  const el = document.createElement('input')
                  el.value = text
                  document.body.appendChild(el)
                  el.select()
                  document.execCommand('copy')
                  document.body.removeChild(el)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                })
              }
            }}
            className="h-8 px-3 rounded-lg border border-navy/10 text-navy/40 text-xs font-body hover:border-navy/20 hover:text-navy transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-status-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span className="text-status-success">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}

      <h2 className="font-display text-base font-semibold text-navy">Find a friend</h2>

      <form onSubmit={(e) => void handleSearch(e)} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-navy/30 pointer-events-none">#</span>
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setSearched(false) }}
            placeholder="000000"
            inputMode="numeric"
            className="w-full h-10 pl-7 pr-3 rounded-lg bg-white border border-navy/10 text-sm text-navy font-mono placeholder:text-navy/20 outline-none focus:border-lego-yellow/50 transition-colors tracking-widest"
          />
        </div>
        <button
          type="submit"
          disabled={code.length < 6 || searchUser.isPending}
          className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-body font-semibold disabled:opacity-40 hover:bg-navy/85 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          {searchUser.isPending ? <Spinner size="sm" /> : 'Search'}
        </button>
      </form>

      {searched && (
        <div className="border-t border-navy/8 pt-4">
          {result === 'not-found' && (
            <p className="text-sm text-navy/40 font-body">No user found with that email.</p>
          )}
          {result === 'already-friend' && (
            <p className="text-sm text-status-success font-body">Already friends.</p>
          )}
          {result === 'pending' && (
            <p className="text-sm text-navy/50 font-body">Friend request already sent.</p>
          )}
          {result && typeof result === 'object' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar src={result.photoURL} name={result.displayName} size="md" />
                <div>
                  <p className="text-sm font-semibold text-navy font-body">{result.displayName}</p>
                  <p className="text-xs text-navy/40 font-body">{result.email}</p>
                </div>
              </div>
              <button
                onClick={() => void handleSend()}
                disabled={sendRequest.isPending}
                className="h-8 px-3 rounded-lg bg-lego-yellow text-navy text-xs font-semibold font-body hover:bg-lego-yellow/80 disabled:opacity-40 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                {sendRequest.isPending
                  ? <Spinner size="sm" />
                  : <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                      Add friend
                    </>
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Request card ─────────────────────────────────────────────────────────────

function ReceivedRequestCard({ request, userId }: { request: FriendRequest; userId: string }) {
  const accept = useAcceptFriendRequest()
  const reject = useRejectFriendRequest()
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(cardRef.current, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
  }, { scope: cardRef })

  return (
    <div ref={cardRef} className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-lego-yellow/25 bg-lego-yellow/[0.03]">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={request.fromPhotoURL} name={request.fromDisplayName} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy font-body truncate">{request.fromDisplayName}</p>
          <p className="text-xs text-navy/40 font-body">Wants to be your friend</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => accept.mutate({ requestId: request.id, userId })}
          disabled={accept.isPending || reject.isPending}
          className="h-8 px-3 rounded-lg bg-lego-yellow text-navy text-xs font-semibold font-body hover:bg-lego-yellow/80 disabled:opacity-40 transition-colors"
        >
          {accept.isPending ? <Spinner size="sm" /> : 'Accept'}
        </button>
        <button
          onClick={() => reject.mutate({ requestId: request.id, userId })}
          disabled={accept.isPending || reject.isPending}
          className="h-8 px-3 rounded-lg border border-navy/10 text-navy/50 text-xs font-body hover:border-navy/20 hover:text-navy disabled:opacity-40 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

function SentRequestCard({ request, userId }: { request: FriendRequest; userId: string }) {
  const cancel = useCancelFriendRequest()

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-navy/8">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={request.toPhotoURL} name={request.toDisplayName} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy font-body truncate">{request.toDisplayName}</p>
          <p className="text-xs text-navy/40 font-body">Request pending</p>
        </div>
      </div>
      <button
        onClick={() => cancel.mutate({ requestId: request.id, userId })}
        disabled={cancel.isPending}
        className="h-7 px-2.5 rounded-lg border border-navy/10 text-navy/40 text-xs font-body hover:border-status-error/30 hover:text-status-error disabled:opacity-40 transition-colors flex-shrink-0"
      >
        Cancel
      </button>
    </div>
  )
}

// ─── Project invitation card ──────────────────────────────────────────────────

function ProjectInvitationCard({
  invitation, user,
}: {
  invitation: ProjectInvitation
  user: { userId: string; displayName: string; photoURL: string }
}) {
  const accept = useAcceptProjectInvitation()
  const reject = useRejectProjectInvitation()
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(cardRef.current, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
  }, { scope: cardRef })

  return (
    <div ref={cardRef} className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-navy/10 bg-navy/[0.01]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0">
          {invitation.projectImageUrl ? (
            <img src={invitation.projectImageUrl} alt="" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <svg className="w-4 h-4 text-navy/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy font-body truncate">{invitation.projectName}</p>
          <p className="text-xs text-navy/40 font-body">
            <span className="font-medium">{invitation.fromDisplayName}</span> invited you to build
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => accept.mutate({ invitationId: invitation.id, projectId: invitation.projectId, user })}
          disabled={accept.isPending || reject.isPending}
          className="h-8 px-3 rounded-lg bg-lego-yellow text-navy text-xs font-semibold font-body hover:bg-lego-yellow/80 disabled:opacity-40 transition-colors"
        >
          {accept.isPending ? <Spinner size="sm" /> : 'Join'}
        </button>
        <button
          onClick={() => reject.mutate({ invitationId: invitation.id, userId: user.userId })}
          disabled={accept.isPending || reject.isPending}
          className="h-8 px-3 rounded-lg border border-navy/10 text-navy/50 text-xs font-body hover:border-navy/20 hover:text-navy disabled:opacity-40 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  )
}

// ─── Friend card ──────────────────────────────────────────────────────────────

function FriendCard({ friend, userId }: { friend: Friend; userId: string }) {
  const remove = useRemoveFriend()
  const [confirm, setConfirm] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => {
    gsap.to(cardRef.current, { y: -2, boxShadow: '0 4px 16px -4px rgba(10,22,40,0.14)', duration: 0.2, ease: 'power2.out' })
  })
  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, { y: 0, boxShadow: '0 1px 3px rgba(10,22,40,0.06)', duration: 0.2, ease: 'power2.out' })
  })

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-navy/8 text-center"
      style={{ boxShadow: '0 1px 3px rgba(10,22,40,0.06)' }}
    >
      <Avatar src={friend.photoURL} name={friend.displayName} size="lg" />
      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold text-navy font-body truncate">{friend.displayName}</p>
        <p className="text-xs text-navy/30 font-mono mt-0.5">
          Since {friend.addedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </p>
      </div>
      {confirm ? (
        <div className="flex gap-1.5 w-full">
          <button
            onClick={() => remove.mutate({ userId, friendId: friend.userId })}
            disabled={remove.isPending}
            className="flex-1 h-7 rounded-lg bg-status-error/10 text-status-error text-xs font-semibold font-body hover:bg-status-error/20 disabled:opacity-40 transition-colors"
          >
            {remove.isPending ? <Spinner size="sm" /> : 'Remove'}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="flex-1 h-7 rounded-lg border border-navy/10 text-navy/50 text-xs font-body hover:text-navy transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="w-full h-7 rounded-lg border border-navy/8 text-navy/30 text-xs font-body hover:border-status-error/20 hover:text-status-error/70 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { user } = useAuth()
  const { data: friends = [], isLoading: loadingFriends } = useFriends(user?.uid)
  const { data: received = [] } = useReceivedFriendRequests(user?.uid)
  const { data: sent = [] } = useSentFriendRequests(user?.uid)
  const { data: projectInvites = [] } = useReceivedProjectInvitations(user?.uid)

  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
    )
    gsap.fromTo(
      contentRef.current,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.1 },
    )
  }, [])

  if (!user) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div ref={headerRef} style={{ opacity: 0 }} className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Friends</h1>
        <p className="text-sm text-navy/40 font-body mt-1">
          {friends.length > 0
            ? `${friends.length} friend${friends.length !== 1 ? 's' : ''}`
            : 'Find friends to build together'}
        </p>
      </div>

      <div ref={contentRef} className="space-y-6" style={{ opacity: 0 }}>

        {/* Search */}
        <SearchSection
          userId={user.uid}
          displayName={user.displayName}
          photoURL={user.photoURL}
          friendCode={user.friendCode}
        />

        {/* Pending received requests */}
        {received.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-navy">Requests</h2>
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-lego-yellow text-navy text-[10px] font-mono font-bold flex items-center justify-center">
                {received.length}
              </span>
            </div>
            <div className="space-y-2">
              {received.map(req => (
                <ReceivedRequestCard key={req.id} request={req} userId={user.uid} />
              ))}
            </div>
          </div>
        )}

        {/* Project invitations */}
        {projectInvites.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-navy">Project invitations</h2>
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-navy/10 text-navy text-[10px] font-mono font-bold flex items-center justify-center">
                {projectInvites.length}
              </span>
            </div>
            <div className="space-y-2">
              {projectInvites.map(inv => (
                <ProjectInvitationCard
                  key={inv.id}
                  invitation={inv}
                  user={{ userId: user.uid, displayName: user.displayName, photoURL: user.photoURL }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sent pending requests */}
        {sent.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display text-base font-semibold text-navy">Sent requests</h2>
            <div className="space-y-2">
              {sent.map(req => (
                <SentRequestCard key={req.id} request={req} userId={user.uid} />
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div className="space-y-3">
          {friends.length > 0 && (
            <h2 className="font-display text-base font-semibold text-navy">Your friends</h2>
          )}
          {loadingFriends ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : friends.length === 0 && received.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border border-dashed border-navy/10 bg-navy/[0.02]">
              <svg className="w-10 h-10 text-navy/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="text-sm text-navy/40 font-body">No friends yet — search by code above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {friends.map(friend => (
                <FriendCard key={friend.userId} friend={friend} userId={user.uid} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
