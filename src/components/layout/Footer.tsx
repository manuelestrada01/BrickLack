import { Link } from 'react-router'
import { ROUTES } from '@/router/routePaths'

export function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-navy mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo + tagline */}
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-bold text-cream">
              Brick<span className="text-lego-yellow">lack</span>
            </p>
            <p className="text-xs text-cream/30 font-body mt-0.5">
              Reconstruye tus sets, pieza por pieza.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              to={ROUTES.HOME}
              className="text-xs text-cream/40 hover:text-cream/70 font-body transition-colors"
            >
              Inicio
            </Link>
            <Link
              to={ROUTES.SEARCH}
              className="text-xs text-cream/40 hover:text-cream/70 font-body transition-colors"
            >
              Buscar
            </Link>
            <Link
              to={ROUTES.DASHBOARD}
              className="text-xs text-cream/40 hover:text-cream/70 font-body transition-colors"
            >
              Proyectos
            </Link>
          </nav>

          {/* Credits */}
          <p className="text-xs text-cream/20 font-mono text-center sm:text-right">
            Datos vía{' '}
            <span className="text-cream/40">Rebrickable</span>
            {' · '}
            <span className="text-cream/40">LEGO®</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
