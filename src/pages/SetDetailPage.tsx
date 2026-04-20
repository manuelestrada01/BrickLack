import { useParams } from 'react-router'
import { useSetDetail } from '@/hooks/queries/useSetDetail'
import { useSetParts } from '@/hooks/queries/useSetParts'
import { SetHeader } from '@/components/set/SetHeader'
import { SetPartsList } from '@/components/set/SetPartsList'
import { AddToProjectButton } from '@/components/set/AddToProjectButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

export default function SetDetailPage() {
  const { setId } = useParams<{ setId: string }>()

  const { data: set, isLoading: setLoading, isError: setError } = useSetDetail(setId)
  const { data: parts, isLoading: partsLoading } = useSetParts(setId)

  if (setError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Set no encontrado"
          message="No pudimos cargar este set. Verificá el número e intentá de nuevo."
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
        <SetHeader set={set} />
      ) : null}

      {/* Add to project CTA */}
      {set && (
        <div className="flex justify-start">
          <AddToProjectButton set={set} />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-cream/8" />

      {/* Parts list */}
      <div>
        <h2 className="font-display text-lg font-semibold text-cream mb-4">
          Inventario de piezas
        </h2>
        <SetPartsList
          parts={parts ?? []}
          isLoading={partsLoading}
        />
      </div>
    </div>
  )
}
