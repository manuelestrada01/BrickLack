import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { buildCommunityDetailPath } from '@/router/routePaths'
import { DURATION, EASE } from '@/styles/animations'
import type { Moc } from '@/types'

interface MocCardProps {
  moc: Moc
}

export function MocCard({ moc }: MocCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

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

  return (
    <Link
      ref={cardRef}
      to={buildCommunityDetailPath(moc.id)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-col rounded-brick overflow-hidden bg-white border border-navy/8 shadow-brick"
    >
      {/* Cover image */}
      <div className="relative h-48 bg-navy/5 overflow-hidden flex-shrink-0">
        <img
          ref={imgRef}
          src={moc.imageUrl}
          alt={moc.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.7))' }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-navy leading-tight line-clamp-2 text-center">
          {moc.name}
        </h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs font-mono text-navy/50 pt-1 border-t border-navy/5">
          <div className="flex items-center gap-1.5">
            {moc.authorPhotoURL ? (
              <img
                src={moc.authorPhotoURL}
                alt={moc.authorName}
                className="w-4 h-4 rounded-full"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-navy/10 flex items-center justify-center text-[8px] font-bold text-navy/40">
                {moc.authorName[0]}
              </div>
            )}
            <span className="truncate max-w-[80px]">{moc.authorName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>{moc.totalPieces} pcs</span>
            <div className="flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              <span>{moc.cloneCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{moc.likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
