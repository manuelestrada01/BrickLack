import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (setsQuery.data?.results.length) return
    if (partsQuery.data?.results.length) setTab('pieces')
  }, [setsQuery.data, partsQuery.data])

  const isLoading = tab === 'sets' ? setsQuery.isLoading : partsQuery.isLoading
  const isError = tab === 'sets' ? setsQuery.isError : partsQuery.isError

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy">
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
          <p className="text-sm text-navy/40 font-body mt-1">
            {(setsQuery.data?.count ?? 0).toLocaleString()} sets ·{' '}
            {(partsQuery.data?.count ?? 0).toLocaleString()} pieces
          </p>
        )}
      </div>

      {/* Refined search bar */}
      <SearchBar />

      {/* Tab filters */}
      {queryParam && (
        <SearchFilters
          activeTab={tab}
          onTabChange={setTab}
          setCount={setsQuery.data?.count}
          pieceCount={partsQuery.data?.count}
        />
      )}

      {/* Results */}
      {queryParam ? (
        <SearchResults
          tab={tab}
          sets={setsQuery.data?.results}
          parts={partsQuery.data?.results}
          isLoading={isLoading}
          isError={isError}
          query={queryParam}
        />
      ) : (
        <p className="text-center text-navy/30 font-body text-sm py-16">
          Enter a set number or piece name to search.
        </p>
      )}
    </div>
  )
}
