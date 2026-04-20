import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/queries/useProjects'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routePaths'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: projects, isLoading } = useProjects(user?.uid)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
            Mis proyectos
          </h1>
          {user && (
            <p className="text-sm text-cream/40 font-body mt-1">
              Bienvenido, {user.displayName?.split(' ')[0]}
            </p>
          )}
        </div>
        <Link to={ROUTES.NEW_PROJECT}>
          <Button variant="primary" size="sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && projects && <DashboardStats projects={projects} />}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 rounded-brick bg-navy-50 border border-cream/8 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="w-16 h-16 rounded-brick" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <ProjectGrid projects={projects ?? []} />
      )}
    </div>
  )
}
