import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Skeleton } from '@/components/ui/Skeleton'
import { STAGGER, REVEAL_FROM_BOTTOM } from '@/styles/animations'
import type { RebrickableSubSet } from '@/types/rebrickable'

interface SetSubSetsListProps {
  subSets: RebrickableSubSet[]
  isLoading: boolean
}

export function SetSubSetsList({ subSets, isLoading }: SetSubSetsListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!listRef.current?.children.length) return
      gsap.fromTo(
        listRef.current.children,
        REVEAL_FROM_BOTTOM.from,
        { ...REVEAL_FROM_BOTTOM.to, stagger: STAGGER.LIST },
      )
    },
    { scope: listRef, dependencies: [subSets, isLoading] },
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-brick bg-white border border-navy/8">
            <Skeleton className="w-20 h-20 rounded-brick flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!subSets.length) return null

  return (
    <div ref={listRef} className="space-y-3">
      {subSets.map(({ set, quantity }) => (
        <Link
          key={set.set_num}
          to={`/set/${set.set_num}`}
          className="flex gap-4 p-4 rounded-brick bg-white border border-navy/8 shadow-brick hover:border-lego-yellow/40 transition-colors group block"
        >
          {/* Image */}
          <div className="flex-shrink-0 w-20 h-20 rounded-brick bg-navy/5 flex items-center justify-center overflow-hidden">
            {set.set_img_url ? (
              <img
                src={set.set_img_url}
                alt={set.name}
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <svg className="w-8 h-8 text-navy/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M7 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-lego-yellow/80 bg-lego-yellow/10 border border-lego-yellow/20 px-1.5 py-0.5 rounded-full">
                {set.set_num}
              </span>
              <span className="font-mono text-xs text-navy/30">{set.year}</span>
            </div>
            <p className="font-body text-sm font-medium text-navy group-hover:text-lego-yellow transition-colors leading-snug truncate">
              {set.name}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-navy/40 font-body">
              <span>
                <span className="font-mono text-navy/50">{set.num_parts.toLocaleString()}</span> pieces
              </span>
              {quantity > 1 && (
                <span className="bg-navy/6 px-1.5 py-0.5 rounded text-navy/50">
                  ×{quantity}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-navy/20 self-center flex-shrink-0 group-hover:text-lego-yellow transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      ))}
    </div>
  )
}
