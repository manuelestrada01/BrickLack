import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SetPartItem } from './SetPartItem'
import { Skeleton } from '@/components/ui/Skeleton'
import { STAGGER, REVEAL_FROM_BOTTOM } from '@/styles/animations'
import type { RebrickablePart } from '@/types/rebrickable'

interface SetPartsListProps {
  parts: RebrickablePart[]
  isLoading: boolean
}

const PAGE_SIZE = 50

export function SetPartsList({ parts, isLoading }: SetPartsListProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = parts.filter(
    (p) =>
      p.part.name.toLowerCase().includes(search.toLowerCase()) ||
      p.part.part_num.toLowerCase().includes(search.toLowerCase()) ||
      p.color.name.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(0, page * PAGE_SIZE)

  useGSAP(
    () => {
      if (!listRef.current?.children.length) return
      gsap.fromTo(
        listRef.current.children,
        REVEAL_FROM_BOTTOM.from,
        { ...REVEAL_FROM_BOTTOM.to, stagger: STAGGER.LIST },
      )
    },
    { scope: listRef, dependencies: [parts, isLoading] },
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <Skeleton className="w-10 h-10 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <Skeleton className="w-8 h-4 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter input */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Filtrar por nombre, número o color…"
          className="w-full h-9 pl-9 pr-3 rounded-brick bg-navy-50 border border-cream/10 text-sm text-cream placeholder:text-cream/25 font-body outline-none focus:border-lego-yellow/40 transition-colors"
        />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Count */}
      <p className="text-xs font-mono text-cream/30">
        {filtered.length.toLocaleString()} piezas
        {search && ` (filtrado de ${parts.length.toLocaleString()})`}
      </p>

      {/* List */}
      <div ref={listRef} className="rounded-brick bg-navy-50 border border-cream/8 px-4">
        {paginated.map((part) => (
          <SetPartItem key={`${part.part.part_num}-${part.color.id}`} part={part} />
        ))}
      </div>

      {/* Load more */}
      {page < totalPages && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-2.5 rounded-brick border border-cream/10 text-sm text-cream/50 hover:text-cream hover:border-cream/20 font-body transition-colors"
        >
          Cargar más ({filtered.length - paginated.length} restantes)
        </button>
      )}
    </div>
  )
}
