import { useParams } from 'react-router'
import { useSetDetail } from '@/hooks/queries/useSetDetail'
import { useSetParts } from '@/hooks/queries/useSetParts'
import { useSetSubSets } from '@/hooks/queries/useSetSubSets'
import { SetHeader } from '@/components/set/SetHeader'
import { SetPartsList } from '@/components/set/SetPartsList'
import { SetSubSetsList } from '@/components/set/SetSubSetsList'
import { AddToProjectButton } from '@/components/set/AddToProjectButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

export default function SetDetailPage() {
  const { setId } = useParams<{ setId: string }>()

  const { data: set, isLoading: setLoading, isError: setError } = useSetDetail(setId)
  const { data: parts, isLoading: partsLoading } = useSetParts(setId)

  // A bundle set has num_parts === 0 and no direct parts after loading
  const isBundle = !partsLoading && set?.numParts === 0 && (!parts || parts.length === 0)

  const { data: subSets, isLoading: subSetsLoading } = useSetSubSets(setId, isBundle)

  if (setError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Set not found"
          message="We couldn't load this set. Check the number and try again."
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      {setLoading ? (
        <div className="flex gap-6">
          <Skeleton className="w-40 h-40 rounded-brick flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      ) : set ? (
        <SetHeader set={set} isBundle={isBundle} subSets={subSets} />
      ) : null}

      {/* Add to project CTA */}
      {set && (
        <div className="flex justify-start">
          <AddToProjectButton set={set} />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-navy/8" />

      {/* Parts list or bundle sub-sets */}
      <div>
        {isBundle ? (
          <>
            {/* Bundle notice */}
            <div className="flex items-start gap-3 p-4 rounded-brick bg-lego-yellow/8 border border-lego-yellow/20 mb-6">
              <svg className="w-5 h-5 text-lego-yellow flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
              <div>
                <p className="text-sm font-body font-medium text-navy">Collection set</p>
                <p className="text-xs font-body text-navy/50 mt-0.5">
                  This is a bundle of multiple sets. Click any set below to explore its piece inventory.
                </p>
              </div>
            </div>

            <h2 className="font-display text-lg font-semibold text-navy mb-4">
              Included sets
            </h2>
            <SetSubSetsList subSets={subSets ?? []} isLoading={subSetsLoading} />
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold text-navy mb-4">
              Piece inventory
            </h2>
            <SetPartsList
              parts={parts ?? []}
              isLoading={partsLoading}
            />
          </>
        )}
      </div>
    </div>
  )
}
