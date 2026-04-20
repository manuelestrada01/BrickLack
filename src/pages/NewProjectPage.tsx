import { Link } from 'react-router'
import { NewProjectForm } from '@/components/project/NewProjectForm'
import { ROUTES } from '@/router/routePaths'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-body">
        <Link to={ROUTES.DASHBOARD} className="text-cream/40 hover:text-cream transition-colors">
          Proyectos
        </Link>
        <svg className="w-3.5 h-3.5 text-cream/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-cream/70">Nuevo</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
          Nuevo proyecto
        </h1>
        <p className="text-sm text-cream/40 font-body mt-2">
          Elegí un set para importar su inventario, o creá un proyecto libre.
        </p>
      </div>

      {/* Form */}
      <NewProjectForm />
    </div>
  )
}
