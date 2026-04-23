import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Badge } from '@/components/ui/Badge'
import { buildPiecePath } from '@/router/routePaths'
import { Link } from 'react-router'
import type { PieceIdentification } from '@/types/piece'

interface IdentifyResultProps {
  result: PieceIdentification
  onReset: () => void
}

function scoreToConfidence(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.8) return 'high'
  if (score >= 0.5) return 'medium'
  return 'low'
}

const confidenceLabel = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
}

export function IdentifyResult({ result, onReset }: IdentifyResultProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      )
      const items = containerRef.current?.querySelectorAll('[data-item]')
      if (items?.length) {
        gsap.fromTo(
          items,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.07, ease: 'power2.out', delay: 0.2 },
        )
      }
    },
    { scope: containerRef },
  )

  const confidence = scoreToConfidence(result.score)

  return (
    <div ref={containerRef} className="space-y-5">
      {/* Header */}
      <div data-item className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy">Result</h3>
        <Badge variant={confidence}>{confidenceLabel[confidence]}</Badge>
      </div>

      {/* Piece image + info */}
      <div data-item className="flex items-center gap-4 p-4 rounded-brick bg-white border border-navy/8">
        {result.imgUrl && (
          <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-navy/5 flex items-center justify-center overflow-hidden">
            <img src={result.imgUrl} alt={result.name} className="w-full h-full object-contain p-2" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-body font-semibold text-navy text-sm leading-snug">{result.name}</p>
          <p className="font-mono text-xs text-lego-yellow">{result.partNum}</p>
          <p className="font-mono text-xs text-navy/30">{Math.round(result.score * 100)}% match</p>
        </div>
      </div>

      {/* Link to catalog */}
      <div data-item>
        <Link
          to={buildPiecePath(result.partNum)}
          className="inline-flex items-center gap-2 text-sm text-lego-yellow hover:text-lego-yellow/80 font-body transition-colors"
        >
          View piece in catalog
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* Try again */}
      <div data-item>
        <button
          onClick={onReset}
          className="text-sm text-navy/40 hover:text-navy font-body transition-colors underline underline-offset-2"
        >
          Scan another piece
        </button>
      </div>
    </div>
  )
}
