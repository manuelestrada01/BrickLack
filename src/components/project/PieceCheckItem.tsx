import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTogglePiece } from '@/hooks/mutations/useTogglePiece'
import type { ProjectPiece } from '@/types'

interface PieceCheckItemProps {
  piece: ProjectPiece
  userId: string
  projectId: string
}

export function PieceCheckItem({ piece, userId, projectId }: PieceCheckItemProps) {
  const togglePiece = useTogglePiece()
  const checkRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const isComplete = piece.isComplete
  const colorHex = piece.colorCode ? `#${piece.colorCode}` : '#666'
  const found = piece.quantityFound
  const required = piece.quantityRequired

  const { contextSafe } = useGSAP({ scope: cardRef })

  const mutate = (newQty: number) => {
    togglePiece.mutate({
      userId,
      projectId,
      pieceId: piece.id,
      quantityFound: newQty,
      quantityRequired: required,
    })
  }

  const handleIncrement = contextSafe((e: React.MouseEvent) => {
    e.stopPropagation()
    if (found >= required) return
    const newQty = found + 1
    if (newQty === required && checkRef.current) {
      gsap.fromTo(
        checkRef.current,
        { scale: 0, rotation: -20 },
        { scale: 1, rotation: 0, duration: 0.25, ease: 'back.out(2.5)' },
      )
    }
    mutate(newQty)
  })

  const handleDecrement = contextSafe((e: React.MouseEvent) => {
    e.stopPropagation()
    if (found <= 0) return
    mutate(found - 1)
  })

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col rounded-brick border overflow-hidden transition-colors select-none ${
        isComplete
          ? 'bg-status-success/5 border-status-success/25'
          : 'bg-white border-navy/10'
      }`}
    >
      {/* Completion checkbox (top-right) — marks/unmarks all at once */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          const newQty = isComplete ? 0 : required
          if (!isComplete && checkRef.current) {
            gsap.fromTo(checkRef.current, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.25, ease: 'back.out(2.5)' })
          }
          mutate(newQty)
        }}
        className={`absolute top-2 right-2 w-5 h-5 rounded border flex items-center justify-center z-10 transition-colors cursor-pointer ${
          isComplete
            ? 'bg-status-success border-status-success'
            : 'border-navy/20 bg-white/80 hover:border-navy/50'
        }`}
      >
        {isComplete && (
          <div ref={checkRef}>
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-navy/4 flex items-center justify-center overflow-hidden">
        {piece.imageUrl ? (
          <img
            src={piece.imageUrl}
            alt={piece.name}
            className={`w-full h-full object-contain p-3 transition-opacity ${isComplete ? 'opacity-40' : 'opacity-100'}`}
            loading="lazy"
          />
        ) : (
          <svg className="w-8 h-8 text-navy/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <rect x="7" y="5" width="4" height="4" rx="1" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2.5 pb-2 space-y-1 flex-1">
        <p className={`text-xs font-body leading-snug line-clamp-2 transition-colors ${
          isComplete ? 'text-navy/35 line-through' : 'text-navy font-medium'
        }`}>
          {piece.name}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full border border-navy/15 flex-shrink-0"
            style={{ backgroundColor: colorHex }}
          />
          <span className="font-body text-[10px] text-navy/50 truncate">{piece.color}</span>
        </div>
        <p className="font-mono text-[10px] text-navy/40">{piece.partNum}</p>
      </div>

      {/* Counter */}
      <div className="flex items-center border-t border-navy/8">
        {/* Decrement */}
        <button
          onClick={handleDecrement}
          className="flex-1 py-2 flex items-center justify-center text-navy/80 hover:bg-navy/5 transition-colors"
          aria-label="Remove one"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>

        {/* Count display */}
        <div className="px-2 py-2 border-x border-navy/8">
          <span
            className="font-mono text-sm leading-none"
            style={{ color: isComplete ? '#22C55E' : '#000000' }}
          >
            <span className="font-bold">{found}</span>
            <span className="font-bold">/{required}</span>
          </span>
        </div>

        {/* Increment */}
        <button
          onClick={handleIncrement}
          className="flex-1 py-2 flex items-center justify-center text-navy/80 hover:bg-navy/5 transition-colors"
          aria-label="Add one"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  )
}
