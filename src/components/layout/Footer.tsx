import { Link } from 'react-router'
import { ROUTES } from '@/router/routePaths'

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-[#F5F0E8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo + tagline */}
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-bold text-navy">
              Brick<span className="text-lego-yellow">lack</span>
            </p>
            <p className="text-xs text-navy/40 font-body mt-0.5">
              Rebuild your sets, piece by piece.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              to={ROUTES.HOME}
              className="text-xs text-navy/40 hover:text-navy font-body transition-colors"
            >
              Home
            </Link>
            <Link
              to={ROUTES.SEARCH}
              className="text-xs text-navy/40 hover:text-navy font-body transition-colors"
            >
              Search
            </Link>
            <Link
              to={ROUTES.DASHBOARD}
              className="text-xs text-navy/40 hover:text-navy font-body transition-colors"
            >
              Projects
            </Link>
          </nav>

          {/* Credits */}
          <div className="text-center sm:text-right space-y-0.5">
            <p className="text-xs text-navy/25 font-mono">
              Data via{' '}
              <span className="text-navy/40">Rebrickable</span>
              {' · '}
              <span className="text-navy/40">LEGO®</span>
            </p>
            <p className="text-xs text-navy/25 font-mono">
              Powered by <span className="text-navy/40">Manuel Estrada</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
