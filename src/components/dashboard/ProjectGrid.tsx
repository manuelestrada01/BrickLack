import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ProjectCard } from './ProjectCard'
import { NewProjectCard } from './NewProjectCard'
import { STAGGER, REVEAL_FROM_BOTTOM } from '@/styles/animations'
import type { Project } from '@/types'

interface ProjectGridProps {
  projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const items = gridRef.current?.children
      if (!items?.length) return
      gsap.fromTo(
        items,
        REVEAL_FROM_BOTTOM.from,
        { ...REVEAL_FROM_BOTTOM.to, stagger: STAGGER.CARDS },
      )
    },
    { scope: gridRef, dependencies: [projects.length] },
  )

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <NewProjectCard />
    </div>
  )
}
