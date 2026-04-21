import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useUpdateProject } from '@/hooks/mutations/useUpdateProject'
import { useDeleteProject } from '@/hooks/mutations/useDeleteProject'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ROUTES } from '@/router/routePaths'
import type { Project } from '@/types'

interface ProjectActionsProps {
  project: Project
  userId: string
}

export function ProjectActions({ project, userId }: ProjectActionsProps) {
  const navigate = useNavigate()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [showDelete, setShowDelete] = useState(false)

  const handleStatusToggle = () => {
    const newStatus = project.status === 'in_progress' ? 'paused' : 'in_progress'
    updateProject.mutate({ userId, projectId: project.id, data: { status: newStatus } })
  }

  const handleDelete = async () => {
    await deleteProject.mutateAsync({ userId, projectId: project.id })
    void navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {project.status !== 'completed' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStatusToggle}
          isLoading={updateProject.isPending}
        >
          {project.status === 'in_progress' ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Resume
            </>
          )}
        </Button>
      )}

      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowDelete(true)}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
        Delete
      </Button>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => void handleDelete()}
        title="Delete project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel="Yes, delete"
        isLoading={deleteProject.isPending}
      />
    </div>
  )
}
