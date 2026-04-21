import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { PieceCheckItem } from './PieceCheckItem'
import type { ProjectPiece } from '@/types'

interface PieceChecklistProps {
  pieces: ProjectPiece[]
  isLoading: boolean
  userId: string
  projectId: string
}

type FilterMode = 'all' | 'missing' | 'found'

// Mirrors PieceCheckItem's exact DOM structure — same classes, same proportions
function PieceCardSkeleton() {
  return (
    <div className="relative flex flex-col rounded-brick border border-navy/10 bg-white overflow-hidden">
      {/* Top-right checkbox placeholder */}
      <div className="absolute top-2 right-2 w-5 h-5 rounded border border-navy/20 bg-white/80 z-10" />

      {/* Image area — same aspect-square as real card */}
      <div className="w-full aspect-square bg-navy/[0.07]" />

      {/* Info — same padding/spacing as real card */}
      <div className="px-2.5 pt-2.5 pb-2 space-y-1 flex-1">
        <div className="h-3 w-full rounded bg-navy/[0.1] animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-navy/[0.08] animate-pulse" />
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-navy/[0.1]" />
          <div className="h-2.5 w-16 rounded bg-navy/[0.08] animate-pulse" />
        </div>
        <div className="h-2.5 w-12 rounded bg-navy/[0.07] animate-pulse" />
      </div>

      {/* Counter — same flex/border structure as real card */}
      <div className="flex items-center border-t border-navy/8">
        <div className="flex-1 py-2 flex items-center justify-center">
          <div className="w-3.5 h-0.5 rounded bg-navy/[0.12]" />
        </div>
        <div className="px-2 py-2 border-x border-navy/8">
          <div className="h-4 w-8 rounded bg-navy/[0.1] animate-pulse" />
        </div>
        <div className="flex-1 py-2 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded bg-navy/[0.12]" />
        </div>
      </div>
    </div>
  )
}

const GRID = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'

export function PieceChecklist({ pieces, isLoading, userId, projectId }: PieceChecklistProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (isLoading) return
      const items = listRef.current?.children
      if (!items?.length) return
      gsap.fromTo(
        items,
        { y: 16, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.025, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    },
    { scope: listRef, dependencies: [isLoading] },
  )

  const filters: { key: FilterMode; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'missing', label: 'Missing' },
    { key: 'found', label: 'Found' },
  ]

  const filtered = pieces.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNum.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase())
    if (filter === 'missing') return matchesSearch && !p.isComplete
    if (filter === 'found') return matchesSearch && p.isComplete
    return matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Controls — always rendered, skeletonized when loading */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          {isLoading ? (
            <div className="w-full h-9 rounded-brick bg-navy/[0.08] animate-pulse" />
          ) : (
            <>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, number, or color…"
                className="w-full h-9 pl-9 pr-3 rounded-brick bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/25 font-body outline-none focus:border-lego-yellow/40 transition-colors"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </>
          )}
        </div>

        <div className={`flex items-center gap-1 p-1 rounded-brick border w-fit ${isLoading ? 'bg-navy/[0.05] border-navy/[0.05]' : 'bg-white border-navy/8'}`}>
          {filters.map(({ key, label }) => (
            isLoading ? (
              <div key={key} className="px-3 py-1 rounded-[4px]">
                <div className="h-3 w-8 rounded bg-navy/[0.1] animate-pulse" />
              </div>
            ) : (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-[4px] text-xs font-body transition-colors ${
                  filter === key ? 'bg-lego-yellow text-navy font-semibold' : 'text-navy/50 hover:text-navy'
                }`}
              >
                {label}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Count */}
      {isLoading ? (
        <div className="h-3 w-28 rounded bg-navy/[0.08] animate-pulse" />
      ) : (
        <p className="text-xs font-mono text-navy/30">
          {filtered.length} of {pieces.length} pieces
        </p>
      )}

      {/* Grid — skeleton cards mirror real cards exactly */}
      {isLoading ? (
        <div className={GRID}>
          {[...Array(12)].map((_, i) => <PieceCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-navy/30 font-body">
          No pieces match your filter.
        </p>
      ) : (
        <div ref={listRef} className={GRID}>
          {filtered.map((piece) => (
            <PieceCheckItem key={piece.id} piece={piece} userId={userId} projectId={projectId} />
          ))}
        </div>
      )}
    </div>
  )
}
