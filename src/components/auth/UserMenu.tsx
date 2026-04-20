import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/router/routePaths'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const toggle = () => setIsOpen((v) => !v)

  // Cerrar al hacer click fuera
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

  // Animar el panel
  useGSAP(
    () => {
      if (isOpen) {
        gsap.set(panelRef.current, { display: 'block' })
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: -8, scale: 0.97 },
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
        className="flex items-center gap-2 rounded-brick p-1 hover:bg-navy-100 transition-colors"
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
      >
        <Avatar src={user.photoURL} name={user.displayName} size="sm" />
        <svg
          className={`w-3.5 h-3.5 text-cream/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel — inicialmente oculto */}
      <div
        ref={panelRef}
        style={{ display: 'none' }}
        className="absolute right-0 top-full mt-2 w-56 z-40 bg-navy-50 border border-cream/10 rounded-brick shadow-brick-hover overflow-hidden"
      >
        {/* Header con info del usuario */}
        <div className="px-4 py-3 border-b border-cream/10">
          <p className="text-sm font-semibold text-cream truncate font-body">
            {user.displayName}
          </p>
          <p className="text-xs text-cream/40 truncate font-body mt-0.5">{user.email}</p>
        </div>

        <div className="py-1">
          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-cream/70 hover:text-cream hover:bg-navy-100 transition-colors font-body"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Mis proyectos
          </Link>

          <button
            onClick={() => { setIsOpen(false); void signOut() }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-cream/70 hover:text-status-error hover:bg-navy-100 transition-colors font-body"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
