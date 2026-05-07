import { useRef, useState, useMemo } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { useCommunityMocs } from '@/hooks/queries/useCommunityMocs'
import { MocCard } from '@/components/community/MocCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

type Filter = 'recent' | 'hottest'

export default function CommunityPage() {
  const { data: mocs, isLoading, isError } = useCommunityMocs()
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Filter>('recent')
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const sortedMocs = useMemo(() => {
    if (!mocs) return []
    if (filter === 'hottest') {
      return [...mocs].sort((a, b) => (b.likeCount + b.cloneCount) - (a.likeCount + a.cloneCount))
    }
    return mocs
  }, [mocs, filter])

  useGSAP(() => {
    gsap.fromTo(
      headerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    )
  }, [])

  useGSAP(() => {
    if (!isLoading && mocs) {
      const cards = gridRef.current?.querySelectorAll('[data-moc-card]')
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out' },
        )
      }
    }
  }, [isLoading, mocs])

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div ref={headerRef} style={{ opacity: 0 }} className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">{t('community.title')}</h1>
        <p className="text-sm text-navy/40 font-body mt-1">
          {t('community.subtitle')}
        </p>

        {/* Filters */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {(['recent', 'hottest'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${
                filter === f
                  ? 'bg-lego-yellow text-navy'
                  : 'bg-navy/5 text-navy/50 hover:bg-navy/10 hover:text-navy'
              }`}
            >
              {f === 'recent' ? t('community.recent') : t('community.hottest')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-brick overflow-hidden bg-white border border-navy/8 shadow-brick">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-sm text-navy/40 font-body">
          {t('community.loadError')}
        </div>
      ) : sortedMocs.length > 0 ? (
        <div
          ref={gridRef}
          className="flex flex-wrap justify-center gap-4"
        >
          {sortedMocs.map((moc) => (
            <div key={moc.id} data-moc-card className="w-full sm:w-[280px]">
              <MocCard moc={moc} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('community.emptyTitle')}
          description={t('community.emptyDesc')}
        />
      )}
    </div>
  )
}
