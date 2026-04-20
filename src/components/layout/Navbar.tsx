import { useRef, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { UserMenu } from '@/components/auth/UserMenu'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { ROUTES } from '@/router/routePaths'
import { cn } from '@/utils/cn'

export function Navbar() {
  const { user, isLoading } = useAuth()
  const { toggleMobileMenu } = useUIStore()
  const location = useLocation()

  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // Entrance animation
  useGSAP(
    () => {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 },
      )
    },
    { scope: navRef },
  )

  // Scroll shadow effect
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 'top -60',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })
    return () => trigger.kill()
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <nav
      ref={navRef}
      className={cn(
        'sticky top-0 z-30 w-full transition-shadow duration-300',
        'bg-navy/90 backdrop-blur-md border-b border-cream/10',
        scrolled && 'shadow-brick',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14">

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link
              to={ROUTES.HOME}
              className={cn(
                'text-sm font-body transition-colors',
                isActive(ROUTES.HOME)
                  ? 'text-lego-yellow'
                  : 'text-cream/50 hover:text-lego-yellow',
              )}
            >
              Inicio
            </Link>
            <Link
              to={ROUTES.DASHBOARD}
              className={cn(
                'text-sm font-body transition-colors',
                isActive(ROUTES.DASHBOARD)
                  ? 'text-lego-yellow'
                  : 'text-cream/50 hover:text-lego-yellow',
              )}
            >
              Proyectos
            </Link>
            <Link
              to={ROUTES.HOME}
              className="text-sm font-body text-cream/50 hover:text-lego-yellow transition-colors"
            >
              Nosotros
            </Link>
          </div>

          {/* Right side: auth + hamburger */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Auth — desktop */}
            <div className="hidden md:flex items-center">
              {isLoading ? null : user ? (
                <UserMenu />
              ) : (
                <GoogleSignInButton size="sm" />
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-brick text-cream/70 hover:text-cream hover:bg-navy-100 transition-colors"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
