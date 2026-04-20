import { useParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useProject } from '@/hooks/queries/useProject'
import { useProjectPieces } from '@/hooks/queries/useProjectPieces'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { ProjectProgress } from '@/components/project/ProjectProgress'
import { PieceChecklist } from '@/components/project/PieceChecklist'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()

  const { data: project, isLoading: projectLoading, isError } = useProject(user?.uid, projectId)
  const { data: pieces, isLoading: piecesLoading } = useProjectPieces(user?.uid, projectId)

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState title="Proyecto no encontrado" message="No pudimos cargar este proyecto." />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      {projectLoading ? (
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-brick flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-56 rounded" />
          </div>
        </div>
      ) : project && user ? (
        <ProjectHeader project={project} userId={user.uid} />
      ) : null}

      {/* Progress */}
      {!projectLoading && project && <ProjectProgress project={project} />}

      {/* Divider */}
      <div className="border-t border-cream/8" />

      {/* Checklist */}
      <div>
        <h2 className="font-display text-lg font-semibold text-cream mb-4">
          Lista de piezas
        </h2>
        {user && projectId ? (
          <PieceChecklist
            pieces={pieces ?? []}
            isLoading={piecesLoading}
            userId={user.uid}
            projectId={projectId}
          />
        ) : null}
      </div>
    </div>
  )
}
