import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { PieceCheckItem } from './PieceCheckItem'
import { Skeleton } from '@/components/ui/Skeleton'
import { STAGGER, REVEAL_FROM_BOTTOM } from '@/styles/animations'
import type { ProjectPiece } from '@/types'

interface PieceChecklistProps {
  pieces: ProjectPiece[]
  isLoading: boolean
  userId: string
  projectId: string
}

type FilterMode = 'all' | 'missing' | 'found'

export function PieceChecklist({ pieces, isLoading, userId, projectId }: PieceChecklistProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const items = listRef.current?.children
      if (!items?.length) return
      gsap.fromTo(
        items,
        REVEAL_FROM_BOTTOM.from,
        { ...REVEAL_FROM_BOTTOM.to, stagger: STAGGER.LIST },
      )
    },
    { scope: listRef, dependencies: [pieces.length, isLoading] },
  )

  const filtered = pieces.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNum.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase())

    if (filter === 'missing') return matchesSearch && !p.isComplete
    if (filter === 'found') return matchesSearch && p.isComplete
    return matchesSearch
  })

  const filters: { key: FilterMode; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'missing', label: 'Faltan' },
    { key: 'found', label: 'Encontradas' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
            <Skeleton className="w-9 h-9 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nombre, número o color…"
            className="w-full h-9 pl-9 pr-3 rounded-brick bg-navy-50 border border-cream/10 text-sm text-cream placeholder:text-cream/25 font-body outline-none focus:border-lego-yellow/40 transition-colors"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-brick bg-navy-50 border border-cream/8 w-fit">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-[4px] text-xs font-body transition-colors ${
                filter === key
                  ? 'bg-lego-yellow text-navy font-semibold'
                  : 'text-cream/50 hover:text-cream'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-mono text-cream/30">
        {filtered.length} de {pieces.length} piezas
      </p>

      {/* List */}
      <div ref={listRef} className="rounded-brick bg-navy-50 border border-cream/8 px-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-cream/30 font-body">
            No hay piezas que coincidan.
          </p>
        ) : (
          filtered.map((piece) => (
            <PieceCheckItem
              key={piece.id}
              piece={piece}
              userId={userId}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  )
}
