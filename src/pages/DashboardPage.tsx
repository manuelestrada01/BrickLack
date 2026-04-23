import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/queries/useProjects'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import { DashboardStats } from '@/components/dashboard/DashboardStats'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: projects } = useProjects(user?.uid)

  const statsRef = useRef<HTMLDivElement>(null)
  const animatedStats = useRef(false)

  // Animate stats in once projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !animatedStats.current) {
      animatedStats.current = true
      gsap.fromTo(
        statsRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      )
    }
  }, [projects])

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 py-8 space-y-8">

      {/* Header — always visible */}
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">My projects</h1>
        {user && (
          <p className="text-sm text-navy/40 font-body mt-1">
            Welcome, {user.displayName?.split(' ')[0]}
          </p>
        )}
      </div>

      {/* Stats — animates in when data arrives */}
      {projects && projects.length > 0 && (
        <div ref={statsRef} style={{ opacity: 0 }}>
          <DashboardStats projects={projects} />
        </div>
      )}

      {/* Grid — always rendered to anchor full width; ProjectGrid handles its own GSAP entrance */}
      <ProjectGrid projects={projects ?? []} />

    </div>
  )
}
