import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Project } from '@/types'

interface ProjectProgressProps {
  project: Project
}

export function ProjectProgress({ project }: ProjectProgressProps) {
  const progress = project.totalPieces > 0
    ? (project.foundPieces / project.totalPieces) * 100
    : 0
  const remaining = project.totalPieces - project.foundPieces

  return (
    <div className="p-5 rounded-brick bg-navy-50 border border-cream/8 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-cream/40 font-body uppercase tracking-wider">Progreso</p>
          <p className="font-mono text-3xl font-bold text-lego-yellow mt-0.5">
            {Math.round(progress)}%
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-cream">
            {project.foundPieces.toLocaleString()}
            <span className="text-cream/30 font-normal text-sm"> / {project.totalPieces.toLocaleString()}</span>
          </p>
          <p className="text-xs text-cream/40 font-body mt-0.5">
            {remaining > 0 ? `${remaining.toLocaleString()} restantes` : '¡Completo!'}
          </p>
        </div>
      </div>

      <ProgressBar value={progress} size="md" />
    </div>
  )
}
