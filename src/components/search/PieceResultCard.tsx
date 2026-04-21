import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { buildPiecePath } from '@/router/routePaths'
import { CARD_HOVER_VARS, CARD_UNHOVER_VARS } from '@/styles/animations'
import type { RebrickablePartDetail } from '@/types/rebrickable'

interface PieceResultCardProps {
  part: RebrickablePartDetail
}

export function PieceResultCard({ part }: PieceResultCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => gsap.to(cardRef.current, CARD_HOVER_VARS))
  const onLeave = contextSafe(() => gsap.to(cardRef.current, CARD_UNHOVER_VARS))

  return (
    <Link
      ref={cardRef}
      to={buildPiecePath(part.part_num)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex gap-4 p-4 rounded-brick bg-white border border-navy/8 shadow-brick hover:border-navy/20 transition-[border-color] duration-200"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-brick overflow-hidden bg-navy/5 border border-navy/8 flex items-center justify-center">
        {part.part_img_url ? (
          <img
            src={part.part_img_url}
            alt={part.name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <svg className="w-8 h-8 text-navy/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
            <circle cx="8" cy="5" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="16" cy="5" r="1" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-navy/50 bg-navy/5 border border-navy/10 px-2 py-0.5 rounded-full flex-shrink-0">
            {part.part_num}
          </span>
          {part.year_from > 0 && (
            <span className="font-mono text-xs text-navy/25">
              {part.year_from}–{part.year_to}
            </span>
          )}
        </div>

        <h3 className="font-display text-sm font-semibold text-navy mt-1.5 line-clamp-2">
          {part.name}
        </h3>

        {part.print_of && (
          <p className="text-xs text-navy/30 font-body mt-1">
            Print of {part.print_of}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 self-center text-navy/20">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  )
}
