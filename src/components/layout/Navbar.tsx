import { useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { UserMenu } from '@/components/auth/UserMenu'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { ROUTES } from '@/router/routePaths'
import { cn } from '@/utils/cn'

// ─── Icon helpers (inline SVG, 16×16, stroke-based) ───────────────────────────

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

// ─── Internal NavLink ──────────────────────────────────────────────────────────

function NavLink({
  to,
  active,
  icon,
  children,
}: {
  to: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm font-medium',
        'transition-colors duration-150',
        'border-l-[3px] pl-[9px]',
        active
          ? 'bg-navy/[0.07] text-navy border-lego-yellow'
          : 'text-navy/50 hover:text-navy hover:bg-navy/[0.04] border-transparent',
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {children}
    </Link>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const { user, isLoading } = useAuth()
  const { toggleMobileMenu, heroMode, toggleHeroMode } = useUIStore()
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const hidden = useRef(false)

  useGSAP(() => {
    // Entrance animation
    gsap.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' })
  }, { scope: navRef })

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      if (delta > 8 && currentY > 60 && !hidden.current) {
        // Scrolling down — hide
        gsap.to(navRef.current, { y: '-110%', duration: 0.3, ease: 'power2.in' })
        hidden.current = true
      } else if (delta < -8 && hidden.current) {
        // Scrolling up — show
        gsap.to(navRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' })
        hidden.current = false
      }

      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-30 px-6 h-14 flex items-center bg-[#F5F0E8] border-b border-navy/10">
      <div className="max-w-[90rem] mx-auto w-full grid grid-cols-3 items-center">
        {/* Col 1 — Logo */}
        <Link
          to={ROUTES.HOME}
          className="font-display text-xl font-bold text-navy tracking-tight justify-self-start"
        >
          Brick<span className="text-lego-yellow">lack</span>
        </Link>

        {/* Col 2 — Links (centered) */}
        <div className="hidden md:flex items-center justify-center gap-6">
          <Link
            to={ROUTES.HOME}
            className={cn('text-sm font-body font-medium transition-colors', isActive(ROUTES.HOME) ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Home
          </Link>
          <Link
            to={ROUTES.DASHBOARD}
            className={cn('text-sm font-body font-medium transition-colors', isActive(ROUTES.DASHBOARD) ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Projects
          </Link>
          <Link
            to={ROUTES.SEARCH}
            className={cn('text-sm font-body font-medium transition-colors', location.pathname.startsWith('/search') ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Search
          </Link>
        </div>

        {/* Col 3 — Auth */}
        <div className="flex items-center justify-end gap-3">
          {/* Testing toggle: video ↔ imagen — solo en Home */}
          {location.pathname === ROUTES.HOME && (
            <button
              onClick={toggleHeroMode}
              title={`Hero: ${heroMode} — click para alternar`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-navy/15 text-navy/50 hover:text-navy hover:border-navy/30 transition-colors text-xs font-mono"
            >
              {heroMode === 'video' ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
                    <rect x="2" y="7" width="15" height="10" rx="1.5" />
                    <path d="m17 9 5-2v10l-5-2V9z" />
                  </svg>
                  video
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  imagen
                </>
              )}
            </button>
          )}
          <div className="hidden md:block">
            {isLoading ? null : user ? <UserMenu /> : <GoogleSignInButton size="sm" />}
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-navy"
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>
    </nav>
  )
}
