import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { buildSetPath } from '@/router/routePaths'
import { CARD_HOVER_VARS, CARD_UNHOVER_VARS } from '@/styles/animations'
import type { LegoSet } from '@/types/set'

interface SetResultCardProps {
  set: LegoSet
}

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #112648 0%, #0A1628 100%)'

export function SetResultCard({ set }: SetResultCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => gsap.to(cardRef.current, CARD_HOVER_VARS))
  const onLeave = contextSafe(() => gsap.to(cardRef.current, CARD_UNHOVER_VARS))

  return (
    <Link
      ref={cardRef}
      to={buildSetPath(set.setNum)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex gap-4 p-4 rounded-brick bg-navy-50 border border-cream/8 shadow-brick hover:border-cream/15 transition-[border-color] duration-200"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-brick overflow-hidden bg-navy-100 border border-cream/8 flex items-center justify-center">
        {set.setImgUrl ? (
          <img
            src={set.setImgUrl}
            alt={set.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full" style={{ background: FALLBACK_GRADIENT }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-mono text-xs text-lego-yellow/70 bg-lego-yellow/10 border border-lego-yellow/20 px-2 py-0.5 rounded-full flex-shrink-0">
            {set.setNum}
          </span>
          <span className="font-mono text-xs text-cream/30">{set.year}</span>
        </div>

        <h3 className="font-display text-sm font-semibold text-cream mt-1.5 truncate">
          {set.name}
        </h3>

        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-xs text-cream/40 font-body flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            {set.numParts.toLocaleString()} piezas
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 self-center text-cream/20">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  )
}
