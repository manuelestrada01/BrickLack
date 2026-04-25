import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SetPartItem } from './SetPartItem'
import { Skeleton } from '@/components/ui/Skeleton'
import { REVEAL_FROM_BOTTOM } from '@/styles/animations'
import type { RebrickablePart } from '@/types/rebrickable'

interface SetPartsListProps {
  parts: RebrickablePart[]
  isLoading: boolean
}

// Only animate when there are few enough items that stagger won't be painfully slow
const GSAP_ANIMATE_THRESHOLD = 60

export function SetPartsList({ parts, isLoading }: SetPartsListProps) {
  const [search, setSearch] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = parts.filter(
    (p) =>
      p.part.name.toLowerCase().includes(search.toLowerCase()) ||
      p.part.part_num.toLowerCase().includes(search.toLowerCase()) ||
      p.color.name.toLowerCase().includes(search.toLowerCase()),
  )

  useGSAP(
    () => {
      const items = listRef.current?.children
      if (!items?.length || items.length > GSAP_ANIMATE_THRESHOLD) return
      gsap.fromTo(
        items,
        REVEAL_FROM_BOTTOM.from,
        { ...REVEAL_FROM_BOTTOM.to, stagger: 0.03 },
      )
    },
    { scope: listRef, dependencies: [parts, isLoading, search] },
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, number, or color…"
          className="w-full h-9 pl-9 pr-3 rounded-brick bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/25 font-body outline-none focus:border-lego-yellow/40 transition-colors"
        />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Filtered count — only show when search is active */}
      {search && (
        <p className="text-xs font-mono text-navy/30">
          {filtered.length.toLocaleString()} of {parts.length.toLocaleString()} piece types
        </p>
      )}

      {/* List — all pieces, no local pagination */}
      <div ref={listRef} className="rounded-brick bg-white border border-navy/8 px-4">
        {filtered.map((part) => (
          <SetPartItem key={`${part.part.part_num}-${part.color.id}`} part={part} />
        ))}
      </div>
    </div>
  )
}
