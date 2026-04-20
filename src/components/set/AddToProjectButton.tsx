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
      <p className="text-sm text-cream/40 font-body text-center">
        Iniciá sesión para agregar este set a tus proyectos.
      </p>
    )
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="primary" size="md">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar a proyectos
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nuevo proyecto"
      >
        <div className="space-y-4">
          <p className="text-sm text-cream/50 font-body">
            Se importarán las <span className="text-cream font-mono">{set.numParts.toLocaleString()}</span> piezas del set automáticamente.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-body text-cream/50">Nombre del proyecto</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
              className="w-full h-10 px-3 rounded-brick bg-navy-100 border border-cream/10 text-sm text-cream font-body outline-none focus:border-lego-yellow/40 transition-colors"
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
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleCreate()}
              isLoading={createProject.isPending}
              disabled={!projectName.trim()}
            >
              Crear proyecto
            </Button>
          </div>

          {createProject.isError && (
            <p className="text-xs text-status-error font-body">
              Error al crear el proyecto. Intentá de nuevo.
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}
