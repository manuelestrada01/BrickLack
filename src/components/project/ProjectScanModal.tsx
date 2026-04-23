import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { CameraCapture } from '@/components/identify/CameraCapture'
import { Spinner } from '@/components/ui/Spinner'
import { identifyPiece } from '@/lib/brickognize'
import { useTogglePiece } from '@/hooks/mutations/useTogglePiece'
import { cn } from '@/utils/cn'
import type { ProjectPiece } from '@/types'

// ─── State machine ────────────────────────────────────────────────────────────

type ScanPhase =
  | { phase: 'idle' }
  | { phase: 'scanning' }
  | { phase: 'no-match'; partNum: string }
  | { phase: 'multi-color'; matches: ProjectPiece[] }
  | { phase: 'confirm'; piece: ProjectPiece; qty: number }
  | { phase: 'done'; piece: ProjectPiece }

// ─── Sub-views ────────────────────────────────────────────────────────────────

function NoMatch({ partNum, onReset }: { partNum: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="w-14 h-14 rounded-full bg-status-error/10 border border-status-error/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-status-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-navy">Not in this set</p>
        <p className="text-sm text-navy/40 font-body">
          Part <span className="font-mono text-navy/60">{partNum}</span> doesn't belong to this project.
        </p>
      </div>
      <button onClick={onReset} className="text-sm text-navy/40 hover:text-navy font-body transition-colors underline underline-offset-2">
        Try another piece
      </button>
    </div>
  )
}

function ColorPicker({ matches, onSelect }: { matches: ProjectPiece[]; onSelect: (p: ProjectPiece) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="font-display text-base font-semibold text-navy">Which color did you find?</p>
        <p className="text-sm text-navy/40 font-body">This part appears in multiple colors in your project.</p>
      </div>
      <div className="space-y-2">
        {matches.map((p) => {
          const remaining = p.quantityRequired - p.quantityFound
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              disabled={remaining <= 0}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
                remaining > 0
                  ? 'bg-white border-navy/10 hover:border-lego-yellow/40 hover:bg-lego-yellow/5'
                  : 'bg-navy/3 border-navy/6 opacity-40 cursor-not-allowed',
              )}
            >
              <span
                className="w-5 h-5 rounded-full border border-navy/15 flex-shrink-0"
                style={{ backgroundColor: `#${p.colorCode}` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy font-body">{p.color}</p>
                <p className="text-xs font-mono text-navy/35">{p.quantityFound}/{p.quantityRequired} found</p>
              </div>
              {remaining <= 0 && (
                <span className="text-xs font-body text-status-success font-medium">Complete</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function QuantityConfirm({
  piece,
  qty,
  onQtyChange,
  onConfirm,
  isLoading,
}: {
  piece: ProjectPiece
  qty: number
  onQtyChange: (n: number) => void
  onConfirm: () => void
  isLoading: boolean
}) {
  const remaining = piece.quantityRequired - piece.quantityFound
  const colorHex = piece.colorCode ? `#${piece.colorCode}` : '#aaa'

  return (
    <div className="space-y-5">
      {/* Piece info */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-navy/8">
        {piece.imageUrl && (
          <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-navy/5 flex items-center justify-center overflow-hidden">
            <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-contain p-1.5" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-navy font-body leading-snug line-clamp-2">{piece.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-navy/10 flex-shrink-0" style={{ backgroundColor: colorHex }} />
            <span className="text-xs text-navy/50 font-body">{piece.color}</span>
          </div>
          <p className="font-mono text-xs text-navy/35">{piece.partNum}</p>
        </div>
      </div>

      {/* How many found */}
      <div className="space-y-2">
        <p className="text-sm font-body text-navy/60">
          How many did you find?{' '}
          <span className="text-navy/30">({remaining} still needed)</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="w-9 h-9 rounded-lg border border-navy/10 flex items-center justify-center text-navy/50 hover:text-navy hover:border-navy/20 disabled:opacity-25 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
          <span className="font-mono text-xl font-bold text-navy w-8 text-center">{qty}</span>
          <button
            onClick={() => onQtyChange(Math.min(remaining, qty + 1))}
            disabled={qty >= remaining}
            className="w-9 h-9 rounded-lg border border-navy/10 flex items-center justify-center text-navy/50 hover:text-navy hover:border-navy/20 disabled:opacity-25 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      </div>

      {/* Confirm */}
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full h-10 rounded-xl bg-lego-yellow text-navy font-semibold font-body text-sm flex items-center justify-center gap-2 hover:bg-lego-yellow/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? <Spinner size="sm" /> : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Mark as found
          </>
        )}
      </button>
    </div>
  )
}

function Done({ piece, onClose, onReset }: { piece: ProjectPiece; onClose: () => void; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-4 gap-4">
      <div className="w-14 h-14 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-status-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-navy">Piece marked as found!</p>
        <p className="text-sm text-navy/40 font-body line-clamp-1">{piece.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onReset} className="text-sm text-navy/40 hover:text-navy font-body transition-colors underline underline-offset-2">
          Scan another
        </button>
        <button onClick={onClose} className="h-9 px-4 rounded-lg bg-navy text-white text-sm font-body font-medium hover:bg-navy/85 transition-colors">
          Done
        </button>
      </div>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface ProjectScanModalProps {
  isOpen: boolean
  onClose: () => void
  pieces: ProjectPiece[]
  userId: string
  projectId: string
}

export function ProjectScanModal({ isOpen, onClose, pieces, userId, projectId }: ProjectScanModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [scanState, setScanState] = useState<ScanPhase>({ phase: 'idle' })
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const toggle = useTogglePiece()

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setScanState({ phase: 'idle' })
    }
  }, [isOpen])

  useGSAP(
    () => {
      if (!shouldRender) return
      if (isOpen) {
        gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' })
        gsap.fromTo(cardRef.current, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: 'power3.out', delay: 0.05 })
      } else {
        gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.15, ease: 'none' })
        gsap.to(cardRef.current, { y: 10, autoAlpha: 0, duration: 0.15, ease: 'power2.in', onComplete: () => setShouldRender(false) })
      }
    },
    { dependencies: [isOpen, shouldRender] },
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleCapture = async (imageBase64: string) => {
    setScanState({ phase: 'scanning' })
    try {
      const result = await identifyPiece(imageBase64)
      if (!result.success || !result.data) {
        setScanState({ phase: 'no-match', partNum: '—' })
        return
      }
      const { partNum } = result.data
      const matches = pieces.filter((p) => p.partNum === partNum)
      if (matches.length === 0) {
        setScanState({ phase: 'no-match', partNum })
      } else if (matches.length === 1) {
        setScanState({ phase: 'confirm', piece: matches[0], qty: 1 })
      } else {
        setScanState({ phase: 'multi-color', matches })
      }
    } catch {
      setScanState({ phase: 'no-match', partNum: '—' })
    }
  }

  const handleColorSelect = (piece: ProjectPiece) => {
    setScanState({ phase: 'confirm', piece, qty: 1 })
  }

  const handleConfirm = async () => {
    if (scanState.phase !== 'confirm') return
    const { piece, qty } = scanState
    await toggle.mutateAsync({
      userId,
      projectId,
      pieceId: piece.id,
      quantityFound: piece.quantityFound + qty,
      quantityRequired: piece.quantityRequired,
    })
    setScanState({ phase: 'done', piece })
  }

  const handleReset = () => setScanState({ phase: 'idle' })

  const title =
    scanState.phase === 'idle' || scanState.phase === 'scanning' ? 'Scan a piece' :
    scanState.phase === 'no-match' ? 'Not found' :
    scanState.phase === 'multi-color' ? 'Select color' :
    scanState.phase === 'confirm' ? 'Mark as found' : '✓ Found'

  if (!shouldRender) return null

  return createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ willChange: 'opacity' }}
    >
      <div className="absolute inset-0 bg-navy/40" />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-md bg-[#F5F0E8] rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 0 1px rgba(10,22,40,0.07), 0 24px 48px -8px rgba(10,22,40,0.28)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-navy/8">
          <h2 className="font-display text-base font-semibold text-navy">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-navy/40 hover:text-navy hover:bg-navy/5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {scanState.phase === 'idle' && (
            <CameraCapture onCapture={(b64) => void handleCapture(b64)} isLoading={false} />
          )}
          {scanState.phase === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-navy/50 font-body">Identifying piece…</p>
            </div>
          )}
          {scanState.phase === 'no-match' && (
            <NoMatch partNum={scanState.partNum} onReset={handleReset} />
          )}
          {scanState.phase === 'multi-color' && (
            <ColorPicker matches={scanState.matches} onSelect={handleColorSelect} />
          )}
          {scanState.phase === 'confirm' && (
            <QuantityConfirm
              piece={scanState.piece}
              qty={scanState.qty}
              onQtyChange={(n) => setScanState({ phase: 'confirm', piece: scanState.piece, qty: n })}
              onConfirm={() => void handleConfirm()}
              isLoading={toggle.isPending}
            />
          )}
          {scanState.phase === 'done' && (
            <Done piece={scanState.piece} onClose={onClose} onReset={handleReset} />
          )}
        </div>

        {/* Bottom safe area on mobile */}
        <div className="h-safe-bottom sm:hidden" />
      </div>
    </div>,
    document.body,
  )
}
