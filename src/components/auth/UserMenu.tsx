import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/router/routePaths'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const toggle = () => setIsOpen((v) => !v)

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen])

  // Animate the panel
  useGSAP(
    () => {
      if (isOpen) {
        gsap.set(panelRef.current, { display: 'block' })
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 8, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'back.out(1.5)' },
        )
      } else {
        gsap.to(panelRef.current, {
          opacity: 0, y: -8, scale: 0.97, duration: 0.15, ease: 'power2.in',
          onComplete: () => gsap.set(panelRef.current, { display: 'none' }),
        })
      }
    },
    { dependencies: [isOpen] },
  )

  if (!user) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-navy/[0.06] transition-colors w-full"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-left min-w-0">
          <span className="block text-xs font-semibold text-navy truncate font-body leading-tight">
            {user.displayName}
          </span>
        </span>
        <svg
          className={`w-3.5 h-3.5 text-navy/40 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel — opens upward */}
      <div
        ref={panelRef}
        style={{ display: 'none' }}
        className="absolute left-0 top-full mt-2 w-full z-40 bg-white/95 backdrop-blur-md border border-navy/10 rounded-2xl shadow-sidebar overflow-hidden"
      >
        {/* Header with user info */}
        <div className="px-4 py-3 border-b border-navy/[0.08]">
          <p className="text-sm font-semibold text-navy truncate font-body">
            {user.displayName}
          </p>
          <p className="text-xs text-navy/45 truncate font-body mt-0.5">{user.email}</p>
        </div>

        <div className="py-1">
          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-navy/65 hover:text-navy hover:bg-navy/[0.05] transition-colors font-body"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            My projects
          </Link>

          <button
            onClick={() => { setIsOpen(false); void signOut() }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-navy/65 hover:text-status-error hover:bg-navy/[0.05] transition-colors font-body"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
