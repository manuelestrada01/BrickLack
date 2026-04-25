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

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const { user, isLoading } = useAuth()
  const { toggleMobileMenu } = useUIStore()
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

      if (currentY <= 60) {
        // Always show near top
        if (hidden.current) {
          gsap.to(navRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' })
          hidden.current = false
        }
      } else if (delta > 8 && !hidden.current) {
        // Scrolling down — hide
        gsap.to(navRef.current, { y: '-110%', duration: 0.3, ease: 'power2.in' })
        hidden.current = true
      } else if (delta < -3 && hidden.current) {
        // Scrolling up — show (lower threshold so it responds faster)
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
      <div className="max-w-[90rem] mx-auto w-full flex justify-between items-center md:grid md:grid-cols-3">
        {/* Col 1 — Logo */}
        <Link
          to={ROUTES.HOME}
          className="font-display text-xl font-bold text-navy tracking-tight justify-self-start"
        >
          Brick
          <span style={{ color: '#E3000B' }}>l</span>
          <span style={{ color: '#006CB7' }}>a</span>
          <span style={{ color: '#FBBC05' }}>c</span>
          <span style={{ color: '#00A650' }}>k</span>
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
            className={cn('text-sm font-body font-medium transition-colors', location.pathname === ROUTES.DASHBOARD ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Projects
          </Link>
          <Link
            to={ROUTES.SEARCH}
            className={cn('text-sm font-body font-medium transition-colors', location.pathname.startsWith('/search') ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Search
          </Link>
          <Link
            to={ROUTES.IDENTIFY}
            className={cn('text-sm font-body font-medium transition-colors', isActive(ROUTES.IDENTIFY) ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Scan
          </Link>
          <Link
            to={ROUTES.COMMUNITY}
            className={cn('text-sm font-body font-medium transition-colors', location.pathname.startsWith('/community') ? 'text-navy' : 'text-navy/60 hover:text-navy')}
          >
            Community
          </Link>
        </div>

        {/* Col 3 — Auth */}
        <div className="flex items-center justify-end gap-3">

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
