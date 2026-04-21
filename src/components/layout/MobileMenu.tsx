import { useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/router/routePaths'

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.SEARCH, label: 'Search sets' },
]

const AUTH_LINKS = [
  { to: ROUTES.DASHBOARD, label: 'My projects' },
  { to: ROUTES.IDENTIFY, label: 'Identify piece' },
]

export function MobileMenu() {
  const { user, signOut } = useAuth()
  const { mobileMenuOpen, closeMobileMenu } = useUIStore()
  const location = useLocation()

  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  // Close on route change
  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  useGSAP(
    () => {
      if (mobileMenuOpen) {
        gsap.set([overlayRef.current, panelRef.current], { display: 'block' })
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' },
        )
        gsap.fromTo(
          panelRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.3, ease: 'power3.out' },
        )
        if (itemsRef.current) {
          gsap.fromTo(
            itemsRef.current.children,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.25, stagger: 0.06, ease: 'power2.out', delay: 0.15 },
          )
        }
      } else {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' })
        gsap.to(panelRef.current, {
          x: '100%',
          duration: 0.25,
          ease: 'power3.in',
          onComplete: () => {
            gsap.set([overlayRef.current, panelRef.current], { display: 'none' })
          },
        })
      }
    },
    { dependencies: [mobileMenuOpen] },
  )

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        style={{ display: 'none' }}
        onClick={closeMobileMenu}
        className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        style={{ display: 'none' }}
        className="fixed top-0 right-0 h-full w-72 z-50 bg-[#F5F0E8] border-l border-navy/10 shadow-sidebar flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10">
          <span className="font-display text-xl font-bold text-navy">
            Brick<span className="text-lego-yellow">lack</span>
          </span>
          <button
            onClick={closeMobileMenu}
            className="w-8 h-8 flex items-center justify-center rounded-brick text-navy/40 hover:text-navy hover:bg-navy/5 transition-colors"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div ref={itemsRef} className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-brick text-navy/60 hover:text-navy hover:bg-navy/5 font-body text-sm transition-colors"
            >
              {label}
            </Link>
          ))}

          {user && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-mono text-navy/30 uppercase tracking-widest">My account</p>
              </div>
              {AUTH_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-brick text-navy/60 hover:text-navy hover:bg-navy/5 font-body text-sm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Footer: user info or sign in */}
        <div className="p-4 border-t border-navy/10">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy truncate font-body">{user.displayName}</p>
                  <p className="text-xs text-navy/40 truncate font-body">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { closeMobileMenu(); void signOut() }}
                className="w-full text-left px-3 py-2 rounded-brick text-sm text-status-error hover:bg-navy/5 font-body transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <GoogleSignInButton className="w-full" />
          )}
        </div>
      </div>
    </>
  )
}
