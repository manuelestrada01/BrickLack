import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SetResultCard } from './SetResultCard'
import { PieceResultCard } from './PieceResultCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { STAGGER, REVEAL_FROM_BOTTOM } from '@/styles/animations'
import type { SearchTab } from './SearchFilters'
import type { LegoSet } from '@/types/set'
import type { RebrickablePartDetail } from '@/types/rebrickable'

interface SearchResultsProps {
  tab: SearchTab
  sets?: LegoSet[]
  parts?: RebrickablePartDetail[]
  isLoading: boolean
  isError: boolean
  query: string
}

export function SearchResults({ tab, sets, parts, isLoading, isError, query }: SearchResultsProps) {
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
    { scope: listRef, dependencies: [tab, sets, parts] },
  )

  if (isError) {
    return (
      <ErrorState
        title="Error al buscar"
        message="No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo."
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-brick bg-navy-50 border border-cream/8">
            <Skeleton className="w-20 h-20 rounded-brick flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tab === 'sets') {
    if (!sets?.length) {
      return (
        <EmptyState
          title="Sin resultados"
          description={`No encontramos sets para "${query}". Probá con el número de set (ej: 75192) o un nombre diferente.`}
        />
      )
    }
    return (
      <div ref={listRef} className="space-y-3">
        {sets.map((set) => (
          <SetResultCard key={set.setNum} set={set} />
        ))}
      </div>
    )
  }

  // tab === 'pieces'
  if (!parts?.length) {
    return (
      <EmptyState
        title="Sin resultados"
        description={`No encontramos piezas para "${query}". Probá con el número de parte (ej: 3001) o una descripción diferente.`}
      />
    )
  }

  return (
    <div ref={listRef} className="space-y-3">
      {parts.map((part) => (
        <PieceResultCard key={part.part_num} part={part} />
      ))}
    </div>
  )
}
