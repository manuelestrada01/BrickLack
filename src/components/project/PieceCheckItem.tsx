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
  const rowRef = useRef<HTMLDivElement>(null)

  const isComplete = piece.isComplete
  const colorHex = piece.colorCode ? `#${piece.colorCode}` : '#666'

  const { contextSafe } = useGSAP({ scope: rowRef })

  const handleToggle = contextSafe(() => {
    const newQty = isComplete ? 0 : piece.quantityRequired

    // Animación del checkbox
    if (!isComplete) {
      gsap.fromTo(
        checkRef.current,
        { scale: 0, rotation: -20 },
        { scale: 1, rotation: 0, duration: 0.25, ease: 'back.out(2.5)' },
      )
    }

    togglePiece.mutate({
      userId,
      projectId,
      pieceId: piece.id,
      quantityFound: newQty,
      quantityRequired: piece.quantityRequired,
    })
  })

  return (
    <div
      ref={rowRef}
      onClick={() => handleToggle()}
      className="flex items-center gap-3 py-2.5 border-b border-cream/5 last:border-0 cursor-pointer group"
    >
      {/* Custom checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          isComplete
            ? 'bg-status-success border-status-success'
            : 'border-cream/20 group-hover:border-cream/40'
        }`}
      >
        {isComplete && (
          <div ref={checkRef}>
            <svg className="w-3 h-3 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-9 h-9 rounded bg-navy-100 border border-cream/8 overflow-hidden flex items-center justify-center">
        {piece.imageUrl ? (
          <img
            src={piece.imageUrl}
            alt={piece.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <svg className="w-4 h-4 text-cream/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <rect x="7" y="5" width="4" height="4" rx="1" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-body truncate transition-colors ${isComplete ? 'text-cream/40 line-through' : 'text-cream/80'}`}>
          {piece.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-cream/25">{piece.partNum}</span>
          <span className="flex items-center gap-1 text-xs text-cream/25 font-body">
            <span
              className="w-2 h-2 rounded-full border border-cream/10 flex-shrink-0"
              style={{ backgroundColor: colorHex }}
            />
            {piece.color}
          </span>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex-shrink-0 text-right font-mono text-xs text-cream/30">
        ×{piece.quantityRequired}
      </div>
    </div>
  )
}
