import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useMoc, useMocPieces } from '@/hooks/queries/useMoc'
import { useCloneMoc } from '@/hooks/mutations/useCloneMoc'
import { useReportMoc } from '@/hooks/mutations/useReportMoc'
import { useLikeMoc } from '@/hooks/mutations/useLikeMoc'
import { useMocLike } from '@/hooks/queries/useMocLike'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { buildProjectPath, ROUTES } from '@/router/routePaths'

const REPORT_REASONS = [
  'Inappropriate content',
  'Spam or fake MOC',
  'Copyright violation',
  'Other',
]

export default function CommunityDetailPage() {
  const { mocId } = useParams<{ mocId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: moc, isLoading, isError } = useMoc(mocId)
  const { data: pieces } = useMocPieces(mocId)
  const clone = useCloneMoc()
  const report = useReportMoc()

  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])

  const heartRef = useRef<SVGSVGElement>(null)
  const likeButtonRef = useRef<HTMLButtonElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const piecesRef = useRef<HTMLDivElement>(null)

  const { data: isLiked = false } = useMocLike(mocId, user?.uid)
  const likeMoc = useLikeMoc()

  useGSAP(
    () => {
      if (!moc) return
      const tl = gsap.timeline()
      tl.fromTo(heroRef.current, { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo(
          contentRef.current?.querySelectorAll('[data-reveal]') ?? [],
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out' },
          '-=0.3',
        )
    },
    { dependencies: [!!moc] },
  )

  const handleLike = () => {
    if (!user) { navigate(ROUTES.LOGIN); return }
    gsap.fromTo(
      heartRef.current,
      { scale: 1 },
      { scale: 1.5, duration: 0.18, ease: 'back.out(3)', yoyo: true, repeat: 1 },
    )
    likeMoc.mutate({ mocId: moc!.id, userId: user.uid, currentlyLiked: isLiked })
  }

  const handleClone = () => {
    if (!user) { navigate(ROUTES.LOGIN); return }
    setShowCloneConfirm(true)
  }

  const confirmClone = () => {
    clone.mutate(
      { mocId: moc!.id, userId: user!.uid, userName: user!.displayName ?? '' },
      { onSuccess: (projectId) => { setShowCloneConfirm(false); navigate(buildProjectPath(projectId)) } },
    )
  }

  const confirmReport = () => {
    if (!user) return
    report.mutate(
      { projectId: moc!.id, reporterId: user.uid, reason: reportReason },
      { onSuccess: () => { setShowReportModal(false); navigate(ROUTES.COMMUNITY) } },
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState title="MOC not found" message="This community project doesn't exist or was removed." />
      </div>
    )
  }

  if (isLoading || !moc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-[420px] w-full rounded-brick" />
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-8">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    )
  }

  const isAuthor = user?.uid === moc.authorId

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div ref={heroRef} style={{ opacity: 0 }} className="w-full relative rounded-2xl overflow-hidden h-[420px] bg-navy/5 shadow-[0_8px_0_0_rgba(0,0,0,0.18),0_16px_48px_-8px_rgba(0,0,0,0.28)]">
          <img
            src={moc.imageUrl}
            alt={moc.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* ── TITLE + DESCRIPTION ──────────────────────────── */}
        <div ref={contentRef} className="space-y-2 w-full">
          <h1 data-reveal className="font-display text-2xl sm:text-3xl font-bold text-navy leading-tight text-center">
            {moc.name}
          </h1>
          {moc.description && (
            <p data-reveal className="text-sm text-navy/55 font-body leading-relaxed text-center break-words">
              {moc.description.length > 150 ? `${moc.description.slice(0, 150).trim()}…` : moc.description}
            </p>
          )}
        </div>

        {/* ── META BAR ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 py-4 border-y border-navy/8">
          {/* Author */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {moc.authorPhotoURL ? (
              <img src={moc.authorPhotoURL} alt={moc.authorName} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-lego-yellow flex items-center justify-center text-navy font-bold text-xs">
                {moc.authorName[0]}
              </div>
            )}
            <span className="text-sm font-body text-navy/60">{moc.authorName}</span>
          </div>

          <div className="w-px h-5 bg-navy/10 hidden sm:block" />

          {/* Stats */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold text-navy">{moc.totalPieces}</span>
              <span className="text-xs text-navy/40 font-body">pcs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-navy/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              <span className="font-mono text-sm font-bold text-navy">{moc.cloneCount}</span>
              <span className="text-xs text-navy/40 font-body">clones</span>
            </div>
            <button
              ref={likeButtonRef}
              onClick={handleLike}
              disabled={likeMoc.isPending}
              className="flex items-center gap-1.5 disabled:opacity-50 transition-opacity"
            >
              <svg
                ref={heartRef}
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill={isLiked ? '#EF4444' : 'none'}
                stroke={isLiked ? '#EF4444' : 'rgba(10,22,40,0.3)'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="font-mono text-sm font-bold" style={{ color: isLiked ? '#EF4444' : '#0A1628' }}>
                {moc.likeCount}
              </span>
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isAuthor ? (
              <>
                <button
                  onClick={handleClone}
                  disabled={clone.isPending}
                  className="flex items-center gap-2 bg-lego-yellow text-navy font-display font-bold text-sm px-5 py-2.5 rounded-brick shadow-[0_3px_0_0_rgba(0,0,0,0.18)] hover:-translate-y-px hover:shadow-[0_5px_0_0_rgba(0,0,0,0.18)] active:translate-y-px active:shadow-[0_1px_0_0_rgba(0,0,0,0.18)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" />
                  </svg>
                  {clone.isPending ? 'Adding…' : 'Build this MOC'}
                </button>
                {user && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-xs text-navy/25 hover:text-status-error transition-colors font-body"
                  >
                    Report
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-navy/40 font-display font-semibold text-xs px-3 py-1.5 rounded-full bg-navy/5 border border-navy/8">
                <svg className="w-3 h-3 text-lego-yellow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Your MOC
              </div>
            )}
          </div>
        </div>

        {/* ── PIECES LIST ──────────────────────────────────── */}
        {pieces && pieces.length > 0 && (
          <div ref={piecesRef} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xs font-bold text-navy/40 uppercase tracking-[0.15em]">
                Pieces required
              </h2>
              <span className="bg-navy/5 border border-navy/8 text-navy/50 font-mono text-xs px-2 py-0.5 rounded-full">
                {pieces.length}
              </span>
            </div>

            <div className="rounded-2xl border border-navy/8 bg-white overflow-hidden shadow-brick divide-y divide-navy/5">
              {pieces.map((piece) => (
                <div key={piece.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-navy/[0.02] transition-colors">
                  {/* Piece image */}
                  <div className="w-11 h-11 rounded-lg bg-navy/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {piece.imageUrl ? (
                      <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg className="w-5 h-5 text-navy/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                        <circle cx="8" cy="5" r="1" fill="currentColor" />
                        <circle cx="16" cy="5" r="1" fill="currentColor" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-navy truncate">
                      {piece.name.length > 40 ? piece.name.slice(0, 40) + '…' : piece.name}
                    </p>
                    <p className="font-mono text-xs text-navy/35 mt-0.5">
                      {piece.partNum}
                      <span className="mx-1.5 text-navy/20">·</span>
                      <span
                        className="inline-block px-1.5 py-px rounded text-[10px] font-semibold"
                        style={{ background: 'rgba(10,22,40,0.05)', color: 'rgba(10,22,40,0.5)' }}
                      >
                        {piece.color}
                      </span>
                    </p>
                  </div>

                  {/* Qty badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-lego-yellow/10 border border-lego-yellow/20 flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-navy/70">
                      ×{piece.quantityRequired}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clone confirm */}
      <ConfirmDialog
        isOpen={showCloneConfirm}
        onClose={() => setShowCloneConfirm(false)}
        onConfirm={confirmClone}
        title="Build this MOC?"
        message={`"${moc.name}" will be added to your projects with all ${moc.totalPieces} pieces to track.`}
        confirmLabel="Yes, add to my projects"
        isLoading={clone.isPending}
      />

      {/* Report modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report MOC">
        <div className="space-y-4">
          <p className="text-sm text-navy/60 font-body">
            This MOC will be hidden from the community until reviewed by a moderator.
          </p>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                  className="accent-lego-yellow"
                />
                <span className="text-sm font-body text-navy">{reason}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowReportModal(false)}
              className="flex-1 py-2 rounded-brick border border-navy/10 text-sm font-display text-navy/60 hover:bg-navy/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmReport}
              disabled={report.isPending}
              className="flex-1 py-2 rounded-brick bg-status-error text-white text-sm font-display font-semibold hover:brightness-105 transition-all disabled:opacity-50"
            >
              {report.isPending ? 'Reporting…' : 'Report'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
