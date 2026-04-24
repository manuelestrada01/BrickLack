import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteMoc } from '@/hooks/mutations/useDeleteMoc'
import { buildCommunityDetailPath } from '@/router/routePaths'
import { DURATION, EASE } from '@/styles/animations'
import type { Moc } from '@/types'

interface MyMocCardProps {
  moc: Moc
}

export function MyMocCard({ moc }: MyMocCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const deleteMoc = useDeleteMoc()

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -4,
      boxShadow: '0 6px 0 0 rgba(0,0,0,0.25), 0 12px 32px -4px rgba(0,0,0,0.35)',
      duration: DURATION.FAST,
      ease: EASE.ENTER,
    })
    gsap.to(imgRef.current, { scale: 1.07, duration: 0.5, ease: EASE.ENTER })
  })

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 4px 0 0 rgba(0,0,0,0.25), 0 8px 24px -4px rgba(0,0,0,0.3)',
      duration: DURATION.FAST,
      ease: EASE.ENTER,
    })
    gsap.to(imgRef.current, { scale: 1, duration: 0.5, ease: EASE.ENTER })
  })

  const statusColor = {
    active: 'bg-status-success/10 text-status-success',
    flagged: 'bg-status-warning/10 text-status-warning',
    removed: 'bg-status-error/10 text-status-error',
  }[moc.status]

  return (
    <>
      <Link
        ref={cardRef}
        to={buildCommunityDetailPath(moc.id)}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="flex flex-col rounded-brick overflow-hidden bg-white border border-navy/8 shadow-brick"
      >
        {/* Cover */}
        <div className="relative h-40 bg-navy/5 overflow-hidden flex-shrink-0">
          <img
            ref={imgRef}
            src={moc.imageUrl}
            alt={moc.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowConfirm(true)
            }}
            className="absolute top-3 left-3 text-white/70 hover:text-status-error bg-black/20 hover:bg-white rounded-full p-1.5 transition-all"
            aria-label="Delete MOC"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
              {moc.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-navy leading-tight line-clamp-1">
            {moc.name}
          </h3>
          <div className="flex items-center justify-between text-xs font-mono text-navy/40">
            <span>{moc.totalPieces} pieces</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              <span>{moc.cloneCount} clones</span>
            </div>
          </div>
        </div>
      </Link>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          deleteMoc.mutate({ mocId: moc.id, imageUrl: moc.imageUrl })
          setShowConfirm(false)
        }}
        title="Delete MOC?"
        message={`"${moc.name}" will be permanently removed from the community.`}
        confirmLabel="Yes, delete"
        isLoading={deleteMoc.isPending}
      />
    </>
  )
}
