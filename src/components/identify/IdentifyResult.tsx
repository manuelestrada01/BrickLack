import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Badge } from '@/components/ui/Badge'
import { buildPiecePath, buildSearchPath } from '@/router/routePaths'
import { Link } from 'react-router'
import type { PieceIdentification } from '@/types/piece'

interface IdentifyResultProps {
  result: PieceIdentification
  onReset: () => void
}

const confidenceVariant = {
  high: 'high' as const,
  medium: 'medium' as const,
  low: 'low' as const,
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

  return (
    <div ref={containerRef} className="space-y-5">
      {/* Header */}
      <div data-item className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy">Result</h3>
        <Badge variant={confidenceVariant[result.confidence]}>
          {confidenceLabel[result.confidence]}
        </Badge>
      </div>

      {/* Main info */}
      <div data-item className="grid grid-cols-2 gap-3">
        {[
          { label: 'Type', value: result.type },
          { label: 'Color', value: result.color },
          { label: 'Dimensions', value: result.dimensions },
          { label: 'Part number', value: result.partNum ?? 'Unknown' },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-brick bg-white border border-navy/8">
            <p className="text-xs text-navy/30 font-body">{label}</p>
            <p className="font-mono text-sm text-navy mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Part link */}
      {result.partNum && (
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
      )}

      {/* Known sets */}
      {result.knownSets.length > 0 && (
        <div data-item className="space-y-2">
          <p className="text-xs text-navy/40 font-body uppercase tracking-wider">Appears in sets</p>
          <div className="flex flex-wrap gap-2">
            {result.knownSets.map((setNum) => (
              <Link
                key={setNum}
                to={buildSearchPath(setNum)}
                className="font-mono text-xs text-navy/60 hover:text-navy bg-white border border-navy/10 hover:border-navy/20 px-2.5 py-1 rounded-full transition-colors"
              >
                {setNum}
              </Link>
            ))}
          </div>
        </div>
      )}

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
