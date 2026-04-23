import { StatusBadge } from '@/components/ui/Badge'
import type { Project } from '@/types'

interface ProjectHeaderProps {
  project: Project
  userId: string
}

function instructionsUrl(setId: string): string {
  const num = setId.split('-')[0]
  return `https://www.lego.com/en-us/service/buildinginstructions/${num}`
}

export function ProjectHeader({ project, userId: _userId }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center text-center sm:text-left">
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
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
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

        {project.setId && (
          <a
            href={instructionsUrl(project.setId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/50 hover:text-navy transition-colors group"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Building instructions
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
