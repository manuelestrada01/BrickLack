import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useCreateProject } from '@/hooks/mutations/useCreateProject'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { buildProjectPath } from '@/router/routePaths'
import type { LegoSet } from '@/types/set'

interface AddToProjectButtonProps {
  set: LegoSet
}

export function AddToProjectButton({ set }: AddToProjectButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [projectName, setProjectName] = useState(set.name)

  const createProject = useCreateProject()

  const handleCreate = async () => {
    if (!user || !projectName.trim()) return

    const projectId = await createProject.mutateAsync({
      userId: user.uid,
      name: projectName.trim(),
      setId: set.setNum,
      setName: set.name,
      setImageUrl: set.setImgUrl,
    })

    setIsOpen(false)
    void navigate(buildProjectPath(projectId))
  }

  if (!user) {
    return (
      <p className="text-sm text-navy/40 font-body text-center">
        Sign in to add this set to your projects.
      </p>
    )
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="primary" size="md">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add to projects
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New project"
      >
        <div className="space-y-4">
          <p className="text-sm text-navy/50 font-body">
            The <span className="text-navy font-mono">{set.numParts.toLocaleString()}</span> pieces from the set will be imported automatically.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-body text-navy/50">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
              className="w-full h-10 px-3 rounded-brick bg-white border border-navy/10 text-sm text-navy font-body outline-none focus:border-lego-yellow/40 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleCreate()}
              isLoading={createProject.isPending}
              disabled={!projectName.trim()}
            >
              Create project
            </Button>
          </div>

          {createProject.isError && (
            <p className="text-xs text-status-error font-body">
              Failed to create the project. Please try again.
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}
