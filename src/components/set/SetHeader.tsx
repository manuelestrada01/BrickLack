import type { LegoSet } from '@/types/set'
import type { RebrickableSubSet } from '@/types/rebrickable'

interface SetHeaderProps {
  set: LegoSet
  isBundle?: boolean
  subSets?: RebrickableSubSet[]
}

export function SetHeader({ set, isBundle, subSets }: SetHeaderProps) {
  return (
    <div className="flex flex-row gap-4 sm:gap-6 items-start">
      {/* Image */}
      <div className="flex-shrink-0 w-28 h-28 sm:w-40 sm:h-40 rounded-brick overflow-hidden bg-white border border-navy/10 flex items-center justify-center">
        {set.setImgUrl ? (
          <img
            src={set.setImgUrl}
            alt={set.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <svg className="w-12 h-12 text-navy/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M7 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-lego-yellow/80 bg-lego-yellow/10 border border-lego-yellow/20 px-2 py-0.5 rounded-full truncate max-w-[140px] sm:max-w-none">
            {set.setNum}
          </span>
          <span className="font-mono text-xs text-navy/30">{set.year}</span>
        </div>

        <h1 className="font-display text-xl sm:text-3xl font-bold text-navy leading-tight break-words">
          {set.name}
        </h1>

        <div className="flex items-center gap-4 flex-wrap">
          {isBundle ? (
            <div className="flex items-center gap-1.5 text-sm text-navy/50 font-body">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span className="font-mono text-lego-yellow">
                {subSets ? subSets.length : '—'}
              </span>
              <span>{subSets?.length === 1 ? 'set' : 'sets'} included</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-navy/50 font-body">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M7 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
              </svg>
              <span className="font-mono text-lego-yellow">{set.numParts.toLocaleString()}</span>
              <span>pieces</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
