import { useParams } from 'react-router'
import { usePieceDetail } from '@/hooks/queries/usePieceDetail'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'

export default function PieceDetailPage() {
  const { partNum } = useParams<{ partNum: string }>()
  const { data: part, isLoading, isError } = usePieceDetail(partNum)

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState title="Pieza no encontrada" message="No pudimos cargar esta pieza." />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {isLoading ? (
        <div className="flex gap-6">
          <Skeleton className="w-36 h-36 rounded-brick flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-7 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      ) : part ? (
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Image */}
          <div className="flex-shrink-0 w-36 h-36 rounded-brick overflow-hidden bg-navy-50 border border-cream/10 flex items-center justify-center">
            {part.part_img_url ? (
              <img src={part.part_img_url} alt={part.name} className="w-full h-full object-contain p-3" />
            ) : (
              <svg className="w-12 h-12 text-cream/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="8" width="18" height="12" rx="2" />
                <rect x="7" y="5" width="4" height="4" rx="1" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default">{part.part_num}</Badge>
              {part.year_from > 0 && (
                <span className="font-mono text-xs text-cream/30">
                  {part.year_from}–{part.year_to}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold text-cream">{part.name}</h1>

            {part.print_of && (
              <p className="text-sm text-cream/40 font-body">
                Impresión de <span className="font-mono text-cream/60">{part.print_of}</span>
              </p>
            )}

            {/* External IDs */}
            {Object.keys(part.external_ids).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-cream/30 font-body uppercase tracking-wider">Referencias externas</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(part.external_ids).map(([source, ids]) => (
                    <span key={source} className="text-xs font-mono text-cream/40 bg-navy-50 border border-cream/8 px-2 py-0.5 rounded">
                      {source}: {(ids as string[]).join(', ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
