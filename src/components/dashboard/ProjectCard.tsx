import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { StatusBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { buildProjectPath } from '@/router/routePaths'
import { DURATION, EASE } from '@/styles/animations'
import { useAuth } from '@/hooks/useAuth'
import { useDeleteProject } from '@/hooks/mutations/useDeleteProject'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { user } = useAuth()
  const deleteProject = useDeleteProject()

  const progress = project.totalPieces > 0
    ? Math.round((project.foundPieces / project.totalPieces) * 100)
    : 0

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -4,
      boxShadow: '0 6px 0 0 rgba(0,0,0,0.25), 0 12px 32px -4px rgba(0,0,0,0.35)',
      duration: DURATION.FAST,
      ease: EASE.ENTER,
    })
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1.07,
        duration: 0.5,
        ease: EASE.ENTER,
      })
    }
  })

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 4px 0 0 rgba(0,0,0,0.25), 0 8px 24px -4px rgba(0,0,0,0.3)',
      duration: DURATION.FAST,
      ease: EASE.ENTER,
    })
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1,
        duration: 0.5,
        ease: EASE.ENTER,
      })
    }
  })

  return (
    <>
    <Link
      ref={cardRef}
      to={buildProjectPath(project.id)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-col rounded-brick overflow-hidden bg-white border border-navy/8 shadow-brick"
    >
      {/* Cover image — protagonismo total */}
      <div className="relative h-48 bg-navy/5 overflow-hidden flex-shrink-0">
        {project.setImageUrl ? (
          <img
            ref={imgRef}
            src={project.setImageUrl}
            alt={project.setName ?? project.name}
            className="w-full h-full object-contain p-6"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-cream/8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={0.75}
            >
              <rect x="3" y="8" width="18" height="12" rx="2" />
              <rect x="7" y="5" width="4" height="4" rx="1" />
              <rect x="13" y="5" width="4" height="4" rx="1" />
            </svg>
          </div>
        )}

        {/* Delete button — top-left */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowConfirm(true)
          }}
          className="absolute top-3 left-3 text-navy/30 hover:text-status-error transition-colors"
          aria-label="Delete project"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>

        {/* Status badge — flotando sobre la imagen */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={project.status} />
        </div>

        {/* Gradiente inferior: imagen → contenido */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))' }}
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-3 px-4 py-3">
        {/* Nombre + número de set */}
        <div className="space-y-0.5">
          <h3 className="font-display text-sm font-semibold text-navy leading-tight line-clamp-2">
            {project.name}
          </h3>
          {project.setId && (
            <p className="font-mono text-xs text-navy/60">{project.setId}</p>
          )}
        </div>

        {/* Progreso */}
        <div className="space-y-1.5 pb-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-navy/60">
              {project.foundPieces} / {project.totalPieces} pieces
            </span>
            <span className={progress === 100 ? 'text-status-success font-semibold' : 'text-navy font-semibold'}>
              {progress}%
            </span>
          </div>
          <ProgressBar value={progress} size="sm" variant="light" />
        </div>
      </div>
    </Link>

    <ConfirmDialog
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={() => {
        deleteProject.mutate({ userId: user!.uid, projectId: project.id })
        setShowConfirm(false)
      }}
      title="Delete project"
      message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
      confirmLabel="Yes, delete"
      isLoading={deleteProject.isPending}
    />
    </>
  )
}
