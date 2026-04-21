import { StatusBadge } from '@/components/ui/Badge'
import { ProjectActions } from './ProjectActions'
import type { Project } from '@/types'

interface ProjectHeaderProps {
  project: Project
  userId: string
}

export function ProjectHeader({ project, userId }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* Set image */}
      {project.setImageUrl && (
        <div className="flex-shrink-0 w-24 h-24 rounded-brick overflow-hidden bg-white border border-navy/10 flex items-center justify-center">
          <img
            src={project.setImageUrl}
            alt={project.setName ?? project.name}
            className="w-full h-full object-contain p-1"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={project.status} />
          {project.setId && (
            <span className="font-mono text-xs text-navy/30">{project.setId}</span>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy leading-tight">
          {project.name}
        </h1>

        {project.setName && project.setName !== project.name && (
          <p className="text-sm text-navy/40 font-body">{project.setName}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <ProjectActions project={project} userId={userId} />
      </div>
    </div>
  )
}
