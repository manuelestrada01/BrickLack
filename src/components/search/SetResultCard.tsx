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

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #e8e0d0 0%, #d8cfc0 100%)'

function trunc(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

const CARD_HEIGHT = 88
const CARD_STYLE: React.CSSProperties = {
  height: CARD_HEIGHT,
  minHeight: CARD_HEIGHT,
  maxHeight: CARD_HEIGHT,
  overflow: 'hidden',
}

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
      className="block rounded-brick bg-white border border-navy/8 shadow-brick hover:border-navy/20 transition-[border-color] duration-200"
      style={CARD_STYLE}
    >
      <div className="flex items-center gap-4 px-4 h-full">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-14 h-14 rounded-brick overflow-hidden bg-navy/5 border border-navy/8 flex items-center justify-center">
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
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-lego-yellow/80 bg-lego-yellow/10 border border-lego-yellow/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {trunc(set.setNum, 14)}
            </span>
            <span className="font-mono text-xs text-navy/30 flex-shrink-0">{set.year}</span>
          </div>
          <p className="font-display text-sm font-semibold text-navy leading-tight">
            {trunc(set.name, 40)}
          </p>
          <span className="text-xs text-navy/40 font-body flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            {set.numParts.toLocaleString()} pieces
          </span>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 text-navy/20">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
