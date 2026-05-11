import { useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { useReceivedFriendRequests } from '@/hooks/queries/useFriends'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Avatar } from '@/components/ui/Avatar'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ROUTES } from '@/router/routePaths'
import { cn } from '@/utils/cn'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function FriendsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z" />
      <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z" />
      <path d="M8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      <path d="M16 13c-.29 0-.62.02-.97.05C16.19 13.89 17 15.02 17 16.25V19h7v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function MobileMenu() {
  const { user, signOut } = useAuth()
  const { mobileMenuOpen, closeMobileMenu } = useUIStore()
  const { t } = useTranslation()
  const location = useLocation()
  const { data: friendRequests } = useReceivedFriendRequests(user?.uid)
  const pendingCount = friendRequests?.length ?? 0

  const NAV_LINKS = [
    { to: ROUTES.HOME,      label: t('nav.home'),      icon: <HomeIcon /> },
    { to: ROUTES.SEARCH,    label: t('nav.search'),    icon: <SearchIcon /> },
    { to: ROUTES.COMMUNITY, label: t('nav.community'), icon: <CommunityIcon /> },
  ]

  const AUTH_LINKS = [
    { to: ROUTES.DASHBOARD, label: t('nav.projects'), icon: <GridIcon /> },
    { to: ROUTES.IDENTIFY,  label: t('nav.scan'),     icon: <CameraIcon /> },
    { to: ROUTES.FRIENDS,   label: t('nav.friends'),  icon: <FriendsIcon />, badge: pendingCount },
  ]

  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const itemsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  useGSAP(
    () => {
      if (mobileMenuOpen) {
        gsap.set([overlayRef.current, panelRef.current], { display: 'flex' })
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
        gsap.fromTo(panelRef.current,  { x: '100%' },  { x: '0%',  duration: 0.3,  ease: 'power3.out' })
        if (itemsRef.current) {
          gsap.fromTo(
            itemsRef.current.children,
            { opacity: 0, x: 16 },
            { opacity: 1, x: 0, duration: 0.22, stagger: 0.05, ease: 'power2.out', delay: 0.15 },
          )
        }
      } else {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' })
        gsap.to(panelRef.current, {
          x: '100%',
          duration: 0.25,
          ease: 'power3.in',
          onComplete: () => gsap.set([overlayRef.current, panelRef.current], { display: 'none' }),
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

      {/* Panel */}
      <div
        ref={panelRef}
        style={{ display: 'none' }}
        className="fixed top-0 right-0 h-full w-72 z-50 bg-[#F5F0E8] border-l border-navy/10 shadow-sidebar flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-navy/10 flex-shrink-0">
          <span className="font-display text-xl font-bold text-navy">
            Brick
            <span style={{ color: '#E3000B' }}>l</span>
            <span style={{ color: '#006CB7' }}>a</span>
            <span style={{ color: '#FFD700' }}>c</span>
            <span style={{ color: '#00A650' }}>k</span>
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

        {/* Links */}
        <div ref={itemsRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl font-body text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-navy/[0.07] text-navy'
                  : 'text-navy/55 hover:text-navy hover:bg-navy/[0.04]',
              )}
            >
              <span className={location.pathname === to ? 'text-lego-yellow' : 'text-navy/35'}>
                {icon}
              </span>
              {label}
            </Link>
          ))}

          {user && (
            <>
              <div className="pt-5 pb-2 px-3">
                <p className="text-[10px] font-mono text-navy/30 uppercase tracking-widest">{t('dashboard.title')}</p>
              </div>
              {AUTH_LINKS.map(({ to, label, icon, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl font-body text-sm font-medium transition-colors',
                    location.pathname === to
                      ? 'bg-navy/[0.07] text-navy'
                      : 'text-navy/55 hover:text-navy hover:bg-navy/[0.04]',
                  )}
                >
                  <span className={location.pathname === to ? 'text-lego-yellow' : 'text-navy/35'}>
                    {icon}
                  </span>
                  <span className="flex-1">{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-lego-yellow text-navy text-[10px] font-mono font-bold flex items-center justify-center tabular-nums">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Language */}
        <div className="flex-shrink-0 border-t border-navy/10 py-3">
          <LanguageSwitcher variant="mobile" />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-navy/10">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy truncate font-body leading-tight">{user.displayName}</p>
                  <p className="text-xs text-navy/40 truncate font-mono mt-0.5">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { closeMobileMenu(); void signOut() }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-status-error hover:bg-status-error/5 font-body transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t('ui.signOut', 'Sign out')}
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
