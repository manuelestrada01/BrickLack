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
  isFetchingNextPage?: boolean
  query: string
}

export function SearchResults({ tab, sets, parts, isLoading, isError, isFetchingNextPage, query }: SearchResultsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  useGSAP(
    () => {
      const items = listRef.current?.children
      if (!items?.length) return
      const currentCount = items.length
      const prevCount = prevCountRef.current
      // Only animate items that weren't there before (new page items)
      const newItems = Array.from(items).slice(prevCount)
      prevCountRef.current = currentCount
      if (!newItems.length) return
      gsap.fromTo(
        newItems,
        REVEAL_FROM_BOTTOM.from,
        { ...REVEAL_FROM_BOTTOM.to, stagger: STAGGER.LIST },
      )
    },
    { scope: listRef, dependencies: [tab, sets, parts] },
  )

  // Reset count tracking when tab or query changes so all items animate fresh
  const prevTabRef = useRef(tab)
  const prevQueryRef = useRef(query)
  if (prevTabRef.current !== tab || prevQueryRef.current !== query) {
    prevTabRef.current = tab
    prevQueryRef.current = query
    prevCountRef.current = 0
  }

  const loadingSkeletons = (
    <div className="space-y-3 mt-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-brick bg-white border border-navy/8 shadow-brick">
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

  if (isError) {
    return (
      <ErrorState
        title="Search error"
        message="We couldn't connect to the server. Check your connection and try again."
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-brick bg-white border border-navy/8 shadow-brick">
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
          title="No results"
          description={`No sets found for "${query}". Try a set number (e.g. 75192) or a different name.`}
        />
      )
    }
    return (
      <>
        <div ref={listRef} className="space-y-3">
          {sets.map((set) => (
            <SetResultCard key={set.setNum} set={set} />
          ))}
        </div>
        {isFetchingNextPage && loadingSkeletons}
      </>
    )
  }

  // tab === 'pieces'
  if (!parts?.length) {
    return (
      <EmptyState
        title="No results"
        description={`No parts found for "${query}". Try a part number (e.g. 3001) or a different description.`}
      />
    )
  }

  return (
    <>
      <div ref={listRef} className="space-y-3">
        {parts.map((part) => (
          <PieceResultCard key={part.part_num} part={part} />
        ))}
      </div>
      {isFetchingNextPage && loadingSkeletons}
    </>
  )
}
