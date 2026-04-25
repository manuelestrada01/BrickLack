import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useSetSearch } from '@/hooks/queries/useSetSearch'
import { usePieceSearch } from '@/hooks/queries/usePieceSearch'
import { SearchFilters, type SearchTab } from '@/components/search/SearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchBar } from '@/components/home/SearchBar'
import { useDebounce } from '@/utils/debounce'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const queryParam = searchParams.get('q') ?? ''

  const [tab, setTab] = useState<SearchTab>('sets')
  const debouncedQuery = useDebounce(queryParam, 300)

  const setsQuery = useSetSearch(debouncedQuery)
  const partsQuery = usePieceSearch(debouncedQuery)

  const allSets = useMemo(
    () => setsQuery.data?.pages.flatMap((p) => p.results) ?? [],
    [setsQuery.data],
  )
  const allParts = useMemo(
    () => partsQuery.data?.pages.flatMap((p) => p.results) ?? [],
    [partsQuery.data],
  )

  const setsCount = setsQuery.data?.pages[0]?.count ?? 0
  const partsCount = partsQuery.data?.pages[0]?.count ?? 0

  useEffect(() => {
    if (allSets.length) return
    if (allParts.length) setTab('pieces')
  }, [allSets, allParts])

  const isLoading = tab === 'sets' ? setsQuery.isLoading : partsQuery.isLoading
  const isError = tab === 'sets' ? setsQuery.isError : partsQuery.isError
  const hasNextPage = tab === 'sets' ? setsQuery.hasNextPage : partsQuery.hasNextPage
  const isFetchingNextPage =
    tab === 'sets' ? setsQuery.isFetchingNextPage : partsQuery.isFetchingNextPage
  const fetchNextPage = tab === 'sets' ? setsQuery.fetchNextPage : partsQuery.fetchNextPage

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy text-center">
          {queryParam ? (
            <>
              Results for{' '}
              <span className="text-lego-yellow">"{queryParam}"</span>
            </>
          ) : (
            'Search'
          )}
        </h1>
        {(setsQuery.data || partsQuery.data) && queryParam && (
          <p className="text-sm text-navy/40 font-body mt-1 text-center">
            {setsCount.toLocaleString()} sets · {partsCount.toLocaleString()} pieces
          </p>
        )}
      </div>

      {/* Refined search bar */}
      <SearchBar key={queryParam} defaultValue={queryParam} />

      {/* Tab filters */}
      {queryParam && (
        <SearchFilters
          activeTab={tab}
          onTabChange={setTab}
          setCount={setsCount}
          pieceCount={partsCount}
        />
      )}

      {/* Results */}
      {queryParam ? (
        <>
          <SearchResults
            tab={tab}
            sets={allSets}
            parts={allParts}
            isLoading={isLoading}
            isError={isError}
            query={queryParam}
          />

          {hasNextPage && !isLoading && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-2.5 rounded-brick border border-navy/12 text-navy text-sm font-body font-medium bg-white shadow-brick hover:border-lego-yellow hover:text-lego-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
