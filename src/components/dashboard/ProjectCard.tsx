import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { StatusBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { buildProjectPath } from '@/router/routePaths'
import { CARD_HOVER_VARS, CARD_UNHOVER_VARS } from '@/styles/animations'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const progress = project.totalPieces > 0
    ? Math.round((project.foundPieces / project.totalPieces) * 100)
    : 0

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => gsap.to(cardRef.current, CARD_HOVER_VARS))
  const onLeave = contextSafe(() => gsap.to(cardRef.current, CARD_UNHOVER_VARS))

  return (
    <Link
      ref={cardRef}
      to={buildProjectPath(project.id)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-col gap-4 p-5 rounded-brick bg-navy-50 border border-cream/8 shadow-brick hover:border-cream/15 transition-[border-color] duration-200"
    >
      {/* Set image + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-16 h-16 rounded-brick overflow-hidden bg-navy-100 border border-cream/8 flex items-center justify-center flex-shrink-0">
          {project.setImageUrl ? (
            <img
              src={project.setImageUrl}
              alt={project.setName ?? project.name}
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />
          ) : (
            <svg className="w-7 h-7 text-cream/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="8" width="18" height="12" rx="2" />
              <rect x="7" y="5" width="4" height="4" rx="1" />
            </svg>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Name + set number */}
      <div className="space-y-0.5">
        <h3 className="font-display text-sm font-semibold text-cream line-clamp-2 leading-tight">
          {project.name}
        </h3>
        {project.setId && (
          <p className="font-mono text-xs text-cream/30">{project.setId}</p>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-cream/40">
          <span>{project.foundPieces} / {project.totalPieces} piezas</span>
          <span className={progress === 100 ? 'text-status-success' : 'text-lego-yellow/70'}>
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} size="sm" />
      </div>
    </Link>
  )
}
